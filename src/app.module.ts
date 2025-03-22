import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings/bookings.module';
import { PromotionsModule } from './bookings/promotions/promotions.module';
import { PropertyModule } from './property/property/property.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DB } from './config/constants';
import { CategoryModule } from './property/category/category.module';
import { ReviewsModule } from './property/reviews/reviews.module';
import { CityModule } from './city/city.module';
import { RolesGuard } from './auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { Auth, AuthSchema } from './schemas/auth.schema';

@Module({
  imports: [
    MongooseModule.forRoot(DB, { dbName: 'property-booking' }),
    AuthModule,
    BookingsModule,
    PromotionsModule,
    PropertyModule,
    CategoryModule,
    ReviewsModule,
    CityModule,
    JwtModule.register({}),
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
