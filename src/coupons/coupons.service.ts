import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Coupon, CouponDocument } from 'src/schemas/coupons.schema';
import { CreateCouponsDto } from './coupons.dto';
import { MailService } from 'src/shared/mail.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private couponModel: Model<CouponDocument>,
    private mailerService: MailService,
  ) {}

  generateCouponCode(length = 20) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let coupon = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      coupon += chars[randomIndex];
    }
    return coupon;
  }

  createCoupon(coupon: CreateCouponsDto, userId: string) {
    const code = this.generateCouponCode();

    const couponData = new this.couponModel({
      ...coupon,
      code: code,
      createdBy: userId,
    });

    this.mailerService.sendCouponCode({
      email: coupon.email,
      couponCode: code,
    });
    return couponData.save();
  }

  getCoupons(userId: string) {
    return this.couponModel.find({ createdBy: userId });
  }

  async verifyCoupon({
    couponCode,
    userId,
    totalAmount,
    propertyId,
    email
  }: {
    couponCode: string;
    userId: string;
    totalAmount: number;
    propertyId: string;
    email: string;
  }) {
    const result = await this.couponModel.findOne({
      code: couponCode,
      isExpired: false,
    });

    if (!result) return { success: false, message: 'Coupon not found' };

    if(result.minimumAmount > totalAmount) {
      return { success: false, message: 'Minimum amount not met' };
    }

    if (!result.properties.includes(new mongoose.Types.ObjectId(propertyId))) {
        return { success: false, message: 'Coupon not valid for this property' };
    }

    if (new Date().getTime() > new Date(result.expiryDate).getTime()) {
      return { success: false, message: 'Coupon is expired' };
    }

    if(result.canBeUsedAnyUser === false && result.email !== email) {
      return { success: false, message: 'Coupon is not valid for this user' };
    }

    if (result?.isExpired) {
      return { success: false, message: 'Coupon is expired' };
    }

    result.log.push({
      userId: new mongoose.Types.ObjectId(userId),
      date: new Date(),
    });

    await result.save();

    if (result.log.length > 7) {
      result.isExpired = true;
      await result.save();
      return { success: false, message: 'Coupon is expired' };
    }

    if (result?.isExpired) {
      return { success: false, message: 'Coupon is expired' };
    }

    return {
      success: true,
      message: 'Coupon is valid',
      coupon: result,
    };
  }
}
