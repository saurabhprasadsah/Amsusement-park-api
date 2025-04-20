import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DB, EMAIL, EMAIL_APP_PASSWORD } from './config/constants';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PaymentModule } from './payments/payments.module';
import { BookingModule } from './property/booking/booking.module';
import { PropertyModule } from './property/property/property.module';
import { ReviewsModule } from './property/reviews/reviews.module';
import { MailService } from './shared/mail.service';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    MongooseModule.forRoot(DB, { dbName: 'property-booking' }),
    AuthModule,
    BookingModule,
    // PromotionsModule,
    PropertyModule,
    ReviewsModule,
    JwtModule.register({}),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587, 
        socketTimeout: 200000,
        connectionTimeout: 1000000,
        secure: false,
        tls:{
          rejectUnauthorized: false
        },
        auth: {
          user: EMAIL,
          pass: EMAIL_APP_PASSWORD,
        },
      },
      defaults: {
        from: EMAIL,
      },
      template: {
        dir: path.join(__dirname, 'templates'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    FileUploadModule,
    PaymentModule,
    CouponsModule,
    ReviewsModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
  exports: [MailService]
})
export class AppModule {}
