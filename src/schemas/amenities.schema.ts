import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Amenity extends Document {
  @Prop({ required: true })
  label: string;

  @Prop()
  description: string;

  @Prop({ type: String, required: true })
  icon: string;
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity);
export type AmenityDocument = Amenity & Document;
