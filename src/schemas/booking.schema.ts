import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Property } from './property.schema';
import { Auth } from './auth.schema';

export enum BookingStatus {
  SUCCESS = 'Confirmed',
  PENDING = 'Pending',
}

export enum PaymentStatus {
    PENDING = 'Pending',
    SUCCESS = 'Success',
    FAILED = 'Failed',
}

export enum EntryType {
  CHECK_IN = 'Check In',
  CHECK_OUT = 'Check Out',
}

export enum BookingPassType {
  Single = "Single",
  Multi = "Multi",
}

@Schema()
class PassValidity {
  @Prop({ type: Number })
  noOfPeople: number;

  @Prop({ type: Number })
  noOfChildren: number;
}
@Schema()
class BookingPass {
  @Prop({ type: String, enum: Object.values(BookingPassType) })
  passType: BookingPassType;

  @Prop({ type: String })
  passName: string;

  @Prop({ type: PassValidity })
  passValidity: PassValidity;

  @Prop({ type: Date })
  dateOfUse: Date;

  @Prop({ type: String, required: true })
  bookedByName: string

  @Prop({ type: mongoose.Types.ObjectId, ref: Auth.name })
  bookedBy: mongoose.Types.ObjectId;

  @Prop({ type: Object })
  propertyDetails: {
    propertyName: string;
    category: string;
    location: string;
    logo: string;
  };

  @Prop({ type: String })
  qrCode: string;
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

  @Prop({ type: Object, default: null })
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

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
  })
  bookingStatus: BookingStatus;

  @Prop({ type: Object })
  coupon: any;

  @Prop({ type: [BookingPass], required: true })
  bookingPass: BookingPass[];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
export type BookingDocument = Booking & Document;
