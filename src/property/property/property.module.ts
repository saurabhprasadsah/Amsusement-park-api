import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from 'src/schemas/property.schema';
import {
  PropertyType,
  PropertyTypeSchema,
} from 'src/schemas/property-type.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { Auth, AuthSchema } from 'src/schemas/auth.schema';
import { City, CitySchema } from 'src/schemas/cities.schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    MongooseModule.forFeature([
      {
        name: Property.name,
        schema: PropertySchema,
      },
      {
        name: PropertyType.name,
        schema: PropertyTypeSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: City.name,
        schema: CitySchema
      }
    ]),
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
