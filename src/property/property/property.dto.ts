import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsObject,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetPropertyDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;
}

export class AddressDto {
  @IsString()
  fullAddress: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  mapLink: string;

  @IsString()
  @IsOptional()
  landmark: string;

  @IsNumber()
  @IsOptional()
  lat: number;

  @IsNumber()
  @IsOptional()
  lng: number;
}

class ImageDto {
  @IsNumber()
  order: number;

  @IsString()
  link: string;
}

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsString()
  basicDescription: string;

  @IsString()
  fullDescription: string;

  @IsString({ each: true })
  amenities: string[];

  @IsString()
  logo: string;

  @IsString({ each: true })
  @IsOptional()
  additionalAmenities: string[];

  @IsString()
  propertyType: string;

  @IsString()
  @IsOptional()
  category: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @IsObject()
  contactInfo: any;

  @IsArray()
  gallery: ImageDto[];

  @IsArray()
  thumbnailImage: ImageDto[];

  @IsObject()
  coverPhotos: any;

  @IsString()
  @IsOptional()
  hostedById: string;

  @IsArray()
  price: any[];

  @IsArray()
  discount: any[];

  @IsObject()
  availability: {
    startDate: string;
    endDate: string;
  };

  @IsArray()
  @IsOptional()
  tags: string[];
}
