import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PropertyType } from './property-type.schema';
import { Amenity } from './amenities.schema';

@Schema()
export class Address {
  @Prop({ type: String, required: true, index: true })
  city: string;

  @Prop({ type: String, required: true, index: true })
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

export enum PricingTypes {
  PER_PEOPLE = "PER_PEOPLE",
  PER_ROOM = "PER_ROOM",
  PER_HOUR = "PER_HOUR",
  PER_DAY = "PER_DAY",
  PER_CHILDREN = "PER_CHILDREN",
  CONTACT_SALES = "CONTACT_SALES",
}

export enum DiscountContains {
  NORMAL = "NORMAL",
  PER_PEOPLE = "PER_PEOPLE",
  PER_CHILDREN = "PER_CHILDREN",
}

export enum DiscountRules {
  GREATER_THAN = "greaterThan",
  // LESS_THAN = "lessThan",
  // EQUAL = "equal",
}

@Schema()
export class Price {
  @Prop({
    required: true,
    type: String,
    enum: Object.keys(PricingTypes),
  })
  type: PricingTypes; // ["perPeople", "perRoom", "perHour", "perDay",]

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

  @Prop({ type: [mongoose.Types.ObjectId], ref: Amenity.name }) 
  amenities: mongoose.Types.ObjectId[];

  @Prop({ type: [String] })
  additionalAmenities: string[];

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  propertyType: PropertyType; // Refers to property type table

  @Prop({ required: false, type: String })
  category: string;

  @Prop({ type: Address, required: true })
  address: Address;

  @Prop({ type: ContactInfo, required: true })
  contactInfo: ContactInfo;

  @Prop({ type: [Image] })
  gallery: Image[];

  @Prop({ type: CoverPhotos, required: true })
  coverPhotos: CoverPhotos;

  @Prop({ required: false, type: String, index: true })
  hostedById: string; // Refers to user ID

  @Prop({ required: true, type: [Image] })
  thumbnailImage: Image[];

  @Prop({ type: [Price] })
  price: Price[]; // two price type ["perPeople", "perRoom", "perHour", "perDay",]

  @Prop({ type: Boolean, default: true })
  isActive: boolean = true;

  @Prop({
    type: [{ rule: String, label: String, amountInPercent: Number, quantity: Number, contains: [String] }],
    required: false,
    default: [],
  })
  discount: {
    rule?: DiscountRules;
    amountInPercent: number;
    quantity: number;
    label?: string
    contains: DiscountContains;
  }[];

  @Prop({ type: String, required: false })
  logo: string;

  @Prop({ type: { startDate: Date, endDate: Date } })
  availability: {
    startDate: Date;
    endDate: Date;
  };

  @Prop({ type: [String], required: false, default:[] })
  tags: string[];

  @Prop({ type: Number, default: 0 })
  viewCount: number;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
export type PropertyDocument = Property & Document;
