import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/auth/role.enum';
import { CouponsService } from 'src/coupons/coupons.service';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from 'src/schemas/booking.schema';
import { Coupon, CouponDocument } from 'src/schemas/coupons.schema';
import {
  PropertyType,
  PropertyTypeDocument,
} from 'src/schemas/property-type.schema';
import {
  DiscountContains,
  PricingTypes,
  Property,
  PropertyDocument,
} from 'src/schemas/property.schema';
import { DiscountCalculatorService } from 'src/shared/discount-calculator.service';
import { CreateBooking } from './booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingSchema: Model<BookingDocument>,
    @InjectModel(Property.name)
    private readonly propertySchema: Model<PropertyDocument>,
    private discountCalculatorService: DiscountCalculatorService,
    private couponService: CouponsService,
    // @InjectModel(PropertyType.name)
    // private readonly propertyTypeSchema: Model<PropertyTypeDocument>,
  ) {}

  async calculatePricing(priceCalculation: any, userId: string, email: string) {
    const property = await this.propertySchema.findById(
      priceCalculation.propertyId,
    );
    if (!property) {
      throw new HttpException('Property not found', 404);
    }

    let totalAmount = 0;
    let originalAmount = 0;
    const offers: any[] = [];
    const priceBreakup: any[] = [];
    const allOffers = new Set();
    property.discount.forEach((discount) => allOffers.add(discount.label));

    property.price.map((price) => {
      if (
        price.type === PricingTypes.PER_PEOPLE &&
        priceCalculation.noOfPeople > 0
      ) {
        const p = this.discountCalculatorService.calculatePersonDiscount({
          price,
          noOfPeople: priceCalculation.noOfPeople,
          property,
        });
        totalAmount += p.discountedAmount;
        originalAmount += p.originalAmount;

        if (p.offerMessage) offers.push(p.offerMessage);
        priceBreakup.push({
          originalAmount: p.originalAmount,
          discountedAmount:
            p.discountedAmount === 0 ? p.originalAmount : p.discountedAmount,
          pricing: priceCalculation.noOfPeople + ' People',
          type: price.type,
        });
      }

      if (
        price.type === PricingTypes.PER_CHILDREN &&
        priceCalculation.noOfChildren > 0
      ) {
        const p = this.discountCalculatorService.calculateChildrenDiscount({
          price,
          noOfChildren: priceCalculation.noOfChildren,
          property,
        });
        totalAmount += p.discountedAmount;
        originalAmount += p.originalAmount;

        if (p.offerMessage) offers.push(p.offerMessage);
        priceBreakup.push({
          originalAmount: p.originalAmount,
          discountedAmount:
            p.discountedAmount === 0 ? p.originalAmount : p.discountedAmount,
          pricing: priceCalculation.noOfChildren + ' Children',
          type: price.type,
        });
      }
    });

    let couponResult: any = null;
    let isCouponError = false;

    const offersSet = new Set();
    offers.forEach((item) => {
      offersSet.add(item);
    });

    if (priceCalculation.couponCode) {
      const coupon = await this.couponService.verifyCoupon({
        couponCode: priceCalculation.couponCode,
        userId: userId,
        totalAmount,
        propertyId: property._id as string,
        email: email,
      });

      if (coupon && coupon.success) {
        totalAmount -= coupon.coupon?.discountAmountFlat || 0;
        couponResult = `Coupon applied! You saved ₹${coupon.coupon?.discountAmountFlat}`;
        offersSet.add(
          `Coupon applied! You saved ₹${coupon.coupon?.discountAmountFlat}`,
        );
      } else {
        couponResult = coupon.message;
        isCouponError = true;
      }
    }

    return {
      offersApplied: [...offersSet],
      discountedAmount: totalAmount,
      priceBreakup,
      originalAmount,
      propertyId: property._id,
      allOffers: [...allOffers],
      isCouponError: isCouponError,
      couponResult,
      property,
    };
  }

  async createBooking(booking: CreateBooking, userId, email) {
    const {
      discountedAmount: totalAmount,
      property,
      couponResult,
    } = await this.calculatePricing(booking, userId, email);

    const bookingData = {
      ...booking,
      totalAmount,
      paidAmount: 0,
      bookingStatus: BookingStatus.PENDING,
      hostedById: property.hostedById,
      bookedById: userId,
      coupon: couponResult,
    };

    if (couponResult) {
      await this.couponService.markAsExpired(booking.couponCode);
    }

    if (property.isActive === false) {
      throw new HttpException('Property Type is not active', 400);
    }

    const bookingCreated = await this.bookingSchema.create(bookingData);
    if (!bookingCreated) {
      throw new HttpException('Booking not created', 400);
    }
    return bookingCreated;
  }

  async getMyBookings(
    userId: string,
    role: Role,
    pagination: { page: number; limit: number },
  ) {
    const { page = 1, limit = 100 } = pagination;
    const skip = (page - 1) * limit;
    if (role === Role.User) {
      return this.bookingSchema
        .find({ bookedById: userId })
        .populate('propertyId')
        .skip(skip)
        .limit(limit)
        .lean();
    } else if (role === Role.Admin) {
      return this.bookingSchema
        .find()
        .populate('propertyId')
        .skip(skip)
        .limit(limit)
        .lean();
    }
  }
}
