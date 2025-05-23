import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Role } from 'src/auth/role.enum';
import { Property } from './property.schema';

export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
  Blocked = 'Blocked',
  Deleted = 'Deleted',
}

export enum OtpType {
  ForgetPassword = 'ForgetPassword',
  VerifyAccount = 'VerifyAccount',
}

export type AuthDocument = Auth & Document;
@Schema({ timestamps: true })
export class Auth extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  // @Prop({ type: String, required: true, unique: true })
  // city: string;

  @Prop({ type: Number, required: true })
  phone: number;

  @Prop({ type: String })
  basicDescription: string;

  @Prop({
    type: String,
    required: true,
    default: Role.User,
    enums: Object.values(Role),
  })
  role: Role;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({
    type: [
      {
        _id: mongoose.Types.ObjectId,
        timestamp: Date,
        otp: String,
        isVerified: Boolean,
        otpType: String,
      },
    ],
  })
  otpInfo: {
    _id: mongoose.Types.ObjectId;
    timestamp: Date;
    otp: string;
    isVerified?: boolean;
    otpType: OtpType;
  }[];

  @Prop({
    type: [
      {
        city: String,
        timestamp: Date,
        browser: String,
        ip: String,
        deviceType: String,
        type: String,
      },
    ],
  })
  loginInfo: {
    city: string;
    timestamp: Date;
    browser: string;
    ip: string;
    deviceType: string;
    type: string;
  }[];

  @Prop({ type: String })
  firebaseToken: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: [String] })
  interests: string[];

  @Prop({ type: [String] })
  searchTexts: string[];

  @Prop({ type: [String] })
  previouslyViewed: string[];

  @Prop({ type: [String] })
  likedProperties: string[];

  @Prop({ type: String, enum: Status, default: Status.Active })
  status: Status;

  @Prop({ type: String, required: false })
  profileImage: string;

  @Prop({ type: [String], required: false, default: [] })
  propertyHistory: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], required: false, default: [], ref: Property.name })
  wishlist: string[];
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
