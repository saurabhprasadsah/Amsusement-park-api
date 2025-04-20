import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { Auth } from './auth.schema';
import { Property } from './property.schema';

@Schema({ timestamps: true })
export class Review extends Document {
    @Prop({ required: true, type: Number, min: 1, max: 5 })
    rating: number;

    @Prop({ required: true, type: String })
    review: string;

    @Prop({ required: true, type: Types.ObjectId, ref: Auth.name })
    ratedBy: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: Property.name })
    propertyId: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
export type ReviewDocument = Review & Document;