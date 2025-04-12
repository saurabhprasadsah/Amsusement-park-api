import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/auth/role.enum';
import { CouponsService } from 'src/coupons/coupons.service';
import {
  Booking,
  BookingDocument,
  BookingPassType,
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
import { Auth, AuthDocument } from 'src/schemas/auth.schema';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingSchema: Model<BookingDocument>,
    @InjectModel(Property.name)
    private readonly propertySchema: Model<PropertyDocument>,
    private discountCalculatorService: DiscountCalculatorService,
    private couponService: CouponsService,

    @InjectModel(Auth.name)
    private authModel: Model<AuthDocument>,
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

    const obj:any = { ...bookingData }
    const passes = await this.generateBookingPass(booking.propertyId, booking, userId)

    obj.bookingPass = passes

    const bookingCreated = await this.bookingSchema.create(obj);
    if (!bookingCreated) {
      throw new HttpException('Booking not created', 400);
    }
    return bookingCreated;
  }

  async generateBookingPass(propertyId:string, booking:CreateBooking, userId:string) {
    const property = await this.propertySchema.findById(propertyId);
    if (!property) {
      throw new HttpException('Property not found', 404);
    }

    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const passes:any[] = [];

    let index = 1;
    for(let x =0; x < booking.noOfPeople; x++){
      const bookingPass = {
        passType: BookingPassType.Single,
        passName: `Booking Pass #${index}`,
        passValidity: { 
          noOfPeople: 1,
          noOfChildren: 0,
        },
        // `${booking.noOfPeople || 1} Person(s)  ${booking.noOfChildren}(Child)`,
        dateOfUse: new Date(booking.startDate),
        bookedByName: user.name,
        bookedBy: userId,
        propertyDetails: {
          propertyName: `${property.name || 'N/A'}`,
          category: `${property.category || 'N/A'}`,
          location: `${property.address.city + ', ' + property.address.state}`,
          logo: `${property.logo || 'N/A'}`,
        },
        qrCode: this.generateQr()
      };
      passes.push(bookingPass);
      index++
    }

    for(let x =0; x < booking.noOfChildren; x++){
      const bookingPass = {
        passType: BookingPassType.Single,
        passName: `Booking Pass #${index}`,
        passValidity: { 
          noOfPeople: 0,
          noOfChildren: 1,
        },
        // `${booking.noOfPeople || 1} Person(s)  ${booking.noOfChildren}(Child)`,
        dateOfUse: new Date(booking.startDate),
        bookedByName: user.name,
        bookedBy: userId,
        propertyDetails: {
          propertyName: `${property.name || 'N/A'}`,
          category: `${property.category || 'N/A'}`,
          location: `${property.address.city + ', ' + property.address.state}`,
          logo: `${property.logo || 'N/A'}`,
        },
        qrCode: this.generateQr()
      };
      passes.push(bookingPass);
      index++
    }

    const bookingPassMulti = {
      passType: BookingPassType.Multi,
      passName: `Booking Pass 'Multi'`,
      passValidity: { 
        noOfPeople: booking.noOfPeople || 1,
        noOfChildren: booking.noOfChildren || 0,
      },
      dateOfUse: new Date(booking.startDate),
      bookedByName: user.name,
      bookedBy: userId,
      propertyDetails: {
        propertyName: `${property.name || 'N/A'}`,
        category: `${property.category || 'N/A'}`,
        location: `${property.address.city + ', ' + property.address.state}`,
        logo: `${property.logo || 'N/A'}`,
      },
      qrCode: this.generateQr()
    };

    passes.push(bookingPassMulti);

    return passes
  }

  generateQr(length = 30) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let coupon = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      coupon += chars[randomIndex];
    }
    return coupon;
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

  async verifyBookingPass(qrCode:string){
    const result = await this.bookingSchema.findOne({ 'bookingPass.qrCode': qrCode }, { 'bookingPass.$': 1 });
    if (!result) {
      throw new HttpException("Pass not found", HttpStatus.BAD_REQUEST)
    }
    return result
  }

  async getBookingPass(
    bookingId: string
  ){
    const booking = await this.bookingSchema.findById(bookingId, { bookingPass: 1 });
    if (!booking) {
      throw new HttpException("Booking not found", HttpStatus.BAD_REQUEST)
    }

    return  booking.bookingPass
  }
}
