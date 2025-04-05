import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from 'src/schemas/coupons.schema';
import { CreateCouponsDto } from './coupons.dto';

@Injectable()
export class CouponsService {
    constructor(
        @InjectModel(Coupon.name)
        private couponModel: Model<CouponDocument>
    ) {}

    createCoupon(coupon: CreateCouponsDto, userId: string) {
        const couponData = new this.couponModel({
            ...coupon,
            createdBy: userId,
        });
        return couponData.save();
    }

    getCoupons(userId: string) {
        return this.couponModel.find({ createdBy: userId }).populate('createdBy name');
    }

    async verifyCoupon(
        couponCode: string,
        userId: string,
    ){
        const result = await this.couponModel.findOne({ code: couponCode })
        if(!result){
            throw new HttpException('Coupon not found', 404);
        }
        if(result?.isExpired){
            throw new HttpException('Coupon is expired', 400);
        }
        
        result?.log.push({
            userId: userId,
            date: new Date(),
        })

        if(result?.log && result?.log.length > 5){
            result.isExpired = true;
        }

        await result?.save();

        if(result?.isExpired){
            throw new HttpException('Coupon is expired', 400);
        }

        return { success: true, message: "Coupon is valid" }
    }
}
