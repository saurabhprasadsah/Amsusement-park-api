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

@Module({
  imports: [
    MongooseModule.forRoot(DB, { dbName: 'property-booking' }),
    AuthModule,
    BookingsModule,
    PromotionsModule,
    PropertyModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
