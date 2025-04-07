import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/auth/role.enum';
import { Booking, BookingDocument, BookingStatus } from 'src/schemas/booking.schema';
import { Coupon, CouponDocument } from 'src/schemas/coupons.schema';
import { PropertyType, PropertyTypeDocument } from 'src/schemas/property-type.schema';
import { DiscountContains, PricingTypes, Property, PropertyDocument } from 'src/schemas/property.schema';
import { DiscountCalculatorService } from 'src/shared/discount-calculator.service';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel(Booking.name)
        private readonly bookingSchema: Model<BookingDocument>,
        @InjectModel(Property.name)
        private readonly propertySchema: Model<PropertyDocument>,
        private discountCalculatorService: DiscountCalculatorService,
        @InjectModel(Coupon.name)
        private readonly couponSchema: Model<CouponDocument>,

        // @InjectModel(PropertyType.name)
        // private readonly propertyTypeSchema: Model<PropertyTypeDocument>,
    ) { }

    async calculatePricing(priceCalculation: any, couponCode?: string) {
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
              discountedAmount: p.discountedAmount,
              pricing: priceCalculation.noOfPeople + ' People',
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
              discountedAmount: p.discountedAmount,
              pricing: priceCalculation.noOfChildren + ' Children',
            });
          }
        });
    
        const offersSet = new Set();
        offers.forEach((item) => {
          offersSet.add(item);
        });
        
        let couponsObj;
        if(couponCode){
            const coupons = await this.couponSchema.findOne({ code: couponCode })
            if(!coupons){
                throw new HttpException('Invalid coupon code', 400);
            }
            if(coupons.isExpired){
                throw new HttpException('Coupon code is expired', 400);
            }
            if(coupons.isExpired){
                throw new HttpException('Coupon code is already used', 400);
            }

            if(coupons.minimumAmount > totalAmount){
                throw new HttpException('Minimum amount not met', 400);
            }

            // totalAmount = totalAmount - coupons.discountAmount
            // couponsObj = coupons

            await this.couponSchema.updateOne({ code: couponCode }, { $set: { isExpired: true } })    
        }

        return {
          offersApplied: [...offersSet],
          discountedAmount: totalAmount,
          priceBreakup,
          originalAmount,
          propertyId: property._id,
          property: property,
          coupon: {
            code: couponCode,
            discountAmount: couponsObj ? couponsObj.discountAmount : 0,
          }
        };
      }

    async createBooking(booking, userId) {
        const { discountedAmount: totalAmount, property, coupon } = await this.calculatePricing(booking, booking.couponCode);
        const bookingData = {
            ...booking,
            totalAmount,
            paidAmount: 0,
            bookingStatus: BookingStatus.PENDING,
            hostedById: property.hostedById,
            bookedById: userId,
            coupon
        };

        if (property.isActive === false) {
            throw new HttpException('Property Type is not active', 400);
        }

        const bookingCreated = await this.bookingSchema.create(bookingData);
        if (!bookingCreated) {
            throw new HttpException('Booking not created', 400);
        }
        return bookingCreated;
    }

    async getMyBookings(userId: string, role: Role, pagination: { page: number, limit: number }) {
        const { page = 1, limit = 100 } = pagination;
        const skip = (page - 1) * limit;
        if (role === Role.User) {
            return this.bookingSchema.find({ bookedById: userId }).populate('propertyId').skip(
                skip
            ).limit(limit).lean();
        } else if (role === Role.Admin) {
            return this.bookingSchema.find().populate('propertyId').skip(skip).limit(limit).lean();
        }
    }
}
