import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PropertyType } from './property-type.schema';

@Schema()
export class Address {
  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  mapLink: string;

  @Prop({ type: Number })
  lat: number;

  @Prop({ type: Number })
  lng: number;

  @Prop({ required: true, type: String })
  fullAddress: string;

  @Prop({ type: String })
  landmark: string;
}

@Schema()
export class ContactInfo {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ type: [String] })
  additionalMobiles: string[];

  @Prop({ required: true, type: String })
  primaryMobile: string;

  @Prop({ type: String })
  primaryContactPersonName?: string;
}

@Schema()
export class Image {
  @Prop({ required: true, type: Number })
  order: number;

  @Prop({ required: true, type: String })
  link: string;
}

@Schema()
export class CoverPhotos {
  @Prop({ required: true, type: Number })
  display: number; // e.g., "2 at once", "3 at once", "1 at once"

  @Prop({ type: [{ order: Number, link: String }] })
  data: { order: number; link: string }[];
}

@Schema()
export class Price {
  @Prop({
    required: true,
    type: String,
    enum: ['perPeople', 'perRoom', 'perHour', 'perDay'],
  })
  type: string; // ["perPeople", "perRoom", "perHour", "perDay",]

  @Prop({ required: true, type: Number })
  amount: number;
}

@Schema()
export class Property {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  basicDescription: string;

  @Prop({ type: String })
  fullDescription: string;

  @Prop({ type: [String] })
  amenities: string[]; // Refers to amenities table

  @Prop({ type: [String] })
  additionalAmenities: string[];

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  propertyType: PropertyType; // Refers to property type table

  @Prop({ required: true, type: String })
  category: string;

  @Prop({ type: [Address], required: true })
  address: Address[];

  @Prop({ type: ContactInfo, required: true })
  contactInfo: ContactInfo;

  @Prop({ type: [Image] })
  gallery: Image[];

  @Prop({ type: CoverPhotos, required: true })
  coverPhotos: CoverPhotos;

  @Prop({ required: false, type: String })
  hostedById: string; // Refers to user ID

  @Prop({ required: true, type: [Image] })
  thumbnailImage: Image[];

  @Prop({ type: [Price] })
  price: Price[]; // two price type ["perPeople", "perRoom", "perHour", "perDay",]
}

export const PropertySchema = SchemaFactory.createForClass(Property);
export type PropertyDocument = Property & Document;
