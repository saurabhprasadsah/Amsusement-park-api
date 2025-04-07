import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Auth } from './auth.schema';
import { Property } from './property.schema';

class LogEntry {
  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: Auth.name })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Number, required: false })
  discountAmountPercentage: number;

  @Prop({ type: Number, required: false })
  discountAmountFlat: number;

  @Prop({ type: Date, required: true })
  expiryDate: Date;

  @Prop({ type: mongoose.Types.ObjectId, ref: Auth.name, required: true })
  createdBy: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  minimumAmount: number;

  @Prop({ type: Boolean, required: true, default: false })
  canBeUsedAnyUser: boolean;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: [mongoose.Types.ObjectId], ref: Property.name })
  properties: mongoose.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isExpired: boolean;

  @Prop({ type: [LogEntry], default: [] })
  log: LogEntry[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
export type CouponDocument = Coupon & Document;
