import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payments.service';
import { CreateOrder } from './payments.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create-order')
  @Roles(Role.User, Role.Admin)
  async createOrder(@Body() body: CreateOrder, @Req() req) {
    try {
      const order = await this.paymentService.createOrder(
        body.amount,
        body.bookingId,
        req.user._id,
      );
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-payment')
  @Roles(Role.User, Role.Admin)
  async verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      userId: string;
      bookingId: string;
    },
    @Req() req: any,
  ) {
    try {
      const payment = await this.paymentService.verifyPayment(
        body.razorpayOrderId,
        body.razorpayPaymentId,
        body.razorpaySignature,
        req.user._id,
        body.bookingId,
      );
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      throw new HttpException(
        'Payment verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('refund')
  async initiateRefund(
    @Body()
    body: {
      paymentId: string;
      amount: number;
      reason?: string;
    },
  ) {
    try {
      const refund = await this.paymentService.initiateRefund(
        body.paymentId,
        body.amount,
        body.reason,
      );
      return {
        success: true,
        data: refund,
      };
    } catch (error) {
      throw new HttpException(
        'Refund initiation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':paymentId')
  async getPaymentDetails(@Param('paymentId') paymentId: string) {
    try {
      const payment = await this.paymentService.getPaymentDetails(paymentId);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch payment details',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('booking/:bookingId')
  async getPaymentByBookingId(@Param('bookingId') bookingId: string) {
    try {
      const payment = await this.paymentService.getPaymentByBookingId(bookingId);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch payment details',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
