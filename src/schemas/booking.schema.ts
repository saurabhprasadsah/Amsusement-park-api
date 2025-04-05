import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Property } from './property.schema';
import { Auth } from './auth.schema';

export enum BookingStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    CANCELLED = 'Cancelled',
    EXPIRED = 'Expired',
    REJECTED = 'Rejected',
    REFUNDED = 'Refunded',
}

export enum EntryType {
    CHECK_IN = 'Check In',
    CHECK_OUT = 'Check Out',
}

@Schema({ timestamps: true })
export class Booking extends Document {

    @Prop({ required: true, type: Number })
    totalAmount: string;

    @Prop({ required: false, type: Number })
    paidAmount: string;

    @Prop({ required: false, type: Number })
    noOfPeople: number;

    @Prop({ required: false, type: Number })
    noOfChildren: number;

    @Prop({ required: false, type: Number })
    noOfRoom: string;

    @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Property.name })
    propertyId: Property;

    @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Auth.name })
    hostedById: Auth;

    @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Auth.name })
    bookedById: Auth;

    @Prop({ required: false, type: Date })
    startDate: Date;

    @Prop({ required: false, type: Date })
    endDate: Date;

    @Prop({ required: true, type: Boolean })
    isPayLater: string;

    @Prop({ type: Object })
    paymentInfo: any;

    @Prop({ type: Boolean, required: false })
    requestCallback: boolean;

    @Prop({ type: String, required: false })
    message: string;

    @Prop({ type: [{ entryType: Object.values(EntryType), time: Date }] })
    entry: {
        entryType: EntryType;
        time: Date;
    }[];

    @Prop({ type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING })
    bookingStatus: BookingStatus;

    @Prop({ type: Object })
    coupon: any;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
export type BookingDocument = Booking & Document;
