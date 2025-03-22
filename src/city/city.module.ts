import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from 'src/schemas/cities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: City.name,
        schema: CitySchema
      }
    ])
  ],
  controllers: [CityController],
  providers: [CityService]
})
export class CityModule {}
