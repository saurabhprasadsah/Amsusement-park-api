import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;
@Schema()
export class Auth extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: Number, required: true })
  phone: number;

  @Prop({ type: String })
  basicDescription: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: [{ timestamp: Date, otp: String }] })
  otpInfo: { timestamp: Date; otp: string }[];

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
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
