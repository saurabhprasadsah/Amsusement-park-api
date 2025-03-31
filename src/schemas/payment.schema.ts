import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Auth } from './auth.schema';
import { Booking } from './booking.schema';

@Schema({ timestamps: true })
export class Payment extends Document {

  @Prop({ required: true })
  razorpayOrderId: string;

  @Prop({ required: false })
  razorpayPaymentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Auth.name })
  userId: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Booking.name })
  bookingId: string;

  @Prop({ required: true, type: String })
  receiptId: string;

  @Prop({ type: Object })
  paymentDetails: Record<string, any>;

  @Prop({ default: false })
  isRefunded: boolean;

  @Prop({ type: Date })
  refundedAt: Date;

  @Prop({ type: Number })
  refundAmount: number;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
export type PaymentDocument = Payment & Document;
