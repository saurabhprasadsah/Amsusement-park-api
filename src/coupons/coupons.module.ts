import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from 'src/schemas/coupons.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Coupon.name,
        schema: CouponSchema,
      },
    ]),
    JwtModule.register({})
  ],
  controllers: [CouponsController],
  providers: [CouponsService]
})
export class CouponsModule {}
