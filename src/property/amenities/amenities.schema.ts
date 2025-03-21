import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AmenitiesDocument = Amenities & Document;

@Schema()
export class Amenities extends Document {
  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  label: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AmenitiesSchema = SchemaFactory.createForClass(Amenities);