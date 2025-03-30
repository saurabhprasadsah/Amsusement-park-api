import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/auth/role.enum';
import { Booking, BookingDocument, BookingStatus } from 'src/schemas/booking.schema';
import { PropertyType, PropertyTypeDocument } from 'src/schemas/property-type.schema';
import { PricingTypes, Property, PropertyDocument } from 'src/schemas/property.schema';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel(Booking.name)
        private readonly bookingSchema: Model<BookingDocument>,
        @InjectModel(Property.name)
        private readonly propertySchema: Model<PropertyDocument>,
        // @InjectModel(PropertyType.name)
        // private readonly propertyTypeSchema: Model<PropertyTypeDocument>,
    ) { }

    async calculateTotalAmount(priceCalculation) {
        const property = await this.propertySchema.findById(priceCalculation.propertyId).lean();
        if (!property) {
            throw new HttpException('Property not found', 404);
        }

        let totalAmount = 0
        property.price.map((price) => {
            if (price.type === PricingTypes.PER_PEOPLE) {
                totalAmount += price.amount * priceCalculation.noOfPeople;
            }

            if (price.type === PricingTypes.PER_CHILDREN) {
                totalAmount += price.amount * priceCalculation.noOfChildren;
            }
        });
        return { totalAmount, propertyId: property._id, property };
    }

    async createBooking(booking, userId) {
        const { totalAmount, property } = await this.calculateTotalAmount(booking);
        const bookingData = {
            ...booking,
            totalAmount,
            paidAmount: 0,
            bookingStatus: BookingStatus.PENDING,
            hostedById: property.hostedById,
            bookedById: userId
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
