import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from 'src/schemas/coupons.schema';
import { JwtModule } from '@nestjs/jwt';
import { Auth, AuthSchema } from 'src/schemas/auth.schema';
import { MailService } from 'src/shared/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Coupon.name,
        schema: CouponSchema,
      },
      {
        name: Auth.name,
        schema: AuthSchema
      }
    ]),
    JwtModule.register({})
  ],
  controllers: [CouponsController],
  providers: [CouponsService, MailService]
})
export class CouponsModule {}
