import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class City extends Document {
    @Prop({ required: true, type: String })
    city: string;

    @Prop({ required: true, type: String })
    state: string;

    @Prop({ default: true, type: Boolean, defaultOptions: true })
    isActive: boolean = true;
}

export const CitySchema = SchemaFactory.createForClass(City);
export type CityDocument = City & Document;
