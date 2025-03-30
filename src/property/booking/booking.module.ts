import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from 'src/schemas/booking.schema';
import { Property, PropertySchema } from 'src/schemas/property.schema';
import { JwtModule } from '@nestjs/jwt';
import { Auth, AuthSchema } from 'src/schemas/auth.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Property.name,
        schema: PropertySchema
      },
      {
        name: Auth.name,
        schema: AuthSchema
      },
    ]),
    JwtModule.register({})
  ],
  providers: [BookingService],
  controllers: [BookingController]
})
export class BookingModule {}
