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

  async verifyCoupon(couponCode: string, userId: string) {
    const result = await this.couponModel.findOne({
      code: couponCode,
      isExpired: false,
    });

    if (!result) {
      throw new HttpException('Coupon not found', 404);
    }

    if (new Date().getTime() > new Date(result.expiryDate).getTime()) {
      throw new HttpException('Coupon is expired', 400);
    }

    if (result?.isExpired) {
      throw new HttpException('Coupon is expired', 400);
    }

    result.log.push({
      userId: new mongoose.Types.ObjectId(userId),
      date: new Date(),
    });

    await result.save();

    if (result.log.length > 7) {
      result.isExpired = true;
      await result.save();
      throw new HttpException('Coupon is expired', 400);
    }

    if (result?.isExpired) {
      throw new HttpException('Coupon is expired', 400);
    }

    return {
      success: true,
      message: 'Coupon is valid',
      coupon: result
    };
  }
}
