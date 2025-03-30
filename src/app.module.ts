import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property/property.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DB, EMAIL, EMAIL_APP_PASSWORD } from './config/constants';
import { CategoryModule } from './property/category/category.module';
import { ReviewsModule } from './property/reviews/reviews.module';
import { RolesGuard } from './auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailService } from './shared/mail.service';
import * as path from 'path';
import { BookingModule } from './property/booking/booking.module';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    MongooseModule.forRoot(DB, { dbName: 'property-booking' }),
    AuthModule,
    BookingModule,
    // PromotionsModule,
    PropertyModule,
    CategoryModule,
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
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
  exports: [MailService]
})
export class AppModule {}
