import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Auth } from "./auth.schema";

@Schema({ timestamps: true })
export class Coupon {
    @Prop({ type: String, required: true })
    code: string;
    
    @Prop({ type: Number, required: true })
    discountAmount: number;

    @Prop({ type: Date, required: true })
    expiryDate: Date;

    @Prop({ type: mongoose.Types.ObjectId, ref: Auth.name, required: true })
    createdBy: Auth;

    @Prop({ type: Number, required: true })
    minimumAmount: number;

    @Prop({ type: Boolean, default: false })
    isExpired: boolean;

    @Prop({ type: Array, default: [] })
    log: any[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
export type CouponDocument = Coupon & Document;