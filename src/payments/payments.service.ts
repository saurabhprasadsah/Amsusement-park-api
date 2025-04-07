import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from 'src/config/constants';
import { Booking, BookingDocument, BookingStatus, PaymentStatus } from 'src/schemas/booking.schema';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {
    this.razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount: number, bookingId: string, userId: string) {
    const currency: string = 'INR'
    try {
      const receiptId = `${bookingId}--${new Date().getTime()}`
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receiptId, // paymentid--timestamp
      };

      const order = await this.razorpay.orders.create(options);
      await this.paymentModel.create({
        bookingId: bookingId,
        userId: userId,
        razorpayOrderId: order.id,
        amount: amount,
        receiptId: receiptId,
        currency: currency,
        status: order.status,
        paymentDetails: {
          orderCreatedAt: new Date(),
          orderStatus: order.status,
        },
      });

      await this.bookingModel.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: PaymentStatus.PENDING,
          paymentId: order.id,
        },
        { new: true },
      );
      return {...order, razorPayId: RAZORPAY_KEY_ID};

    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    userId: string,
    bookingId: string,
  ) {
    try {
      const crypto = require('crypto');
      const secret = RAZORPAY_KEY_SECRET;
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (generated_signature === razorpaySignature) {
        // Fetch payment details from Razorpay
        const paymentDetails = await this.razorpay.payments.fetch(razorpayPaymentId);

        // Update payment record with complete information
        const payment = await this.paymentModel.findOneAndUpdate(
          { razorpayOrderId },
          {
            razorpayPaymentId,
            razorpaySignature,
            userId,
            bookingId,
            status: 'success',
            amount: Number(paymentDetails.amount) / 100, // Convert from paise to rupees
            currency: paymentDetails.currency,
            paymentDetails: {
              ...paymentDetails,
              paymentMethod: paymentDetails.method,
              paymentStatus: paymentDetails.status,
              paymentDate: new Date(paymentDetails.created_at * 1000),
              capturedAt: new Date(Number(paymentDetails.captured) * 1000),
              description: paymentDetails.description,
              email: paymentDetails.email,
              contact: paymentDetails.contact,
              notes: paymentDetails.notes,
            },
            updatedAt: new Date(),
          },
          { new: true },
        );

        if (!payment) {
          throw new HttpException('Payment record not found', HttpStatus.NOT_FOUND);
        }

        await this.bookingModel.findByIdAndUpdate(
          bookingId,
          {
            paymentStatus: PaymentStatus.SUCCESS,
            paymentId: payment._id,
            razorpayPaymentId,
          },
          { new: true },
        );

        return payment;
      } else {
        // Update payment record with failed status
        await this.paymentModel.findOneAndUpdate(
          { razorpayOrderId },
          {
            status: 'failed',
            paymentDetails: {
              error: 'Invalid payment signature',
              verificationFailedAt: new Date(),
            },
            updatedAt: new Date(),
          },
        );

        throw new HttpException(
          'Invalid payment signature',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      // Update payment record with error status
      await this.paymentModel.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: 'error',
          paymentDetails: {
            error: error.message,
            errorOccurredAt: new Date(),
          },
          updatedAt: new Date(),
        },
      );

      throw new HttpException(
        'Payment verification failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async initiateRefund(
    paymentId: string,
    amount: number,
    reason: string = 'Customer request',
  ) {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }

      if (payment.isRefunded) {
        throw new HttpException(
          'Payment already refunded',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update payment status to refund initiated
      payment.status = 'refund_initiated';
      payment.paymentDetails.refundInitiatedAt = new Date();
      await payment.save();

      const refund = await this.razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: amount * 100, // Convert to paise
        notes: {
          reason,
        },
      });

      // Update payment record with refund details
      payment.isRefunded = true;
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.refundAmount = amount;
      payment.paymentDetails.refundDetails = {
        refundId: refund.id,
        refundStatus: refund.status,
        refundedAt: new Date(refund.created_at * 1000),
        refundReason: reason,
      };
      await payment.save();

      return refund;
    } catch (error) {
      // Update payment record with refund error
      const payment = await this.paymentModel.findById(paymentId);
      if (payment) {
        payment.status = 'refund_failed';
        payment.paymentDetails.refundError = error.message;
        payment.paymentDetails.refundErrorAt = new Date();
        await payment.save();
      }

      throw new HttpException(
        'Refund initiation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return payment;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch payment details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPaymentByBookingId(bookingId: string) {
    try {
      const payment = await this.paymentModel.findOne({ bookingId });
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return payment;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch payment details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 