import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/auth/role.enum';

export enum Status {
  Active = "Active",
  Inactive = "Inactive",
  Blocked = "Blocked",
  Deleted = "Deleted",
}

export type AuthDocument = Auth & Document;
@Schema()
export class Auth extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

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

  @Prop({ type: [{ timestamp: Date, otp: String, isVerified: Boolean }] })
  otpInfo: { timestamp: Date; otp: string, isVerified?: boolean }[];

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

  @Prop({ type: [String] })
  interests: string[];

  @Prop({ type: [String] })
  searchTexts: string[];

  @Prop({ type: [String] })
  previouslyViewed: string[];

  @Prop({ type: [String] })
  likedProperties: string[];

  @Prop({ type:String, enum: Status, default: Status.Active })
  status: Status;
}


export const AuthSchema = SchemaFactory.createForClass(Auth);
