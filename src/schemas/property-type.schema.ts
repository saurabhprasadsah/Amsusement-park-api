import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PropertyTypeDocument = PropertyType & Document;

@Schema({ timestamps: true })
export class PropertyType {
    @Prop({ type: String, required: true, trim: true })
    label: string;

    @Prop({ type: String, required: false, trim: true })
    description?: string;

    @Prop({ type: [String], required: false })
    properties?: string[];
}

export const PropertyTypeSchema = SchemaFactory.createForClass(PropertyType);
