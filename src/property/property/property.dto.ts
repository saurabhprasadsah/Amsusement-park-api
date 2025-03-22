import { IsOptional, IsString, IsInt, Min, IsObject, IsArray, ValidateNested, IsNumber } from 'class-validator';
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
    name?: string;

    @IsOptional()
    @IsString()
    city?: string;

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
    lat: number

    @IsNumber()
    @IsOptional()
    lng: number
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

    @IsString({ each: true })
    @IsOptional()
    additionalAmenities: string[];

    @IsString()
    propertyType: string;

    @IsString()
    category: string;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsObject()
    address: AddressDto

    @IsObject()
    contactInfo: any

    @IsArray()
    gallery: any[]

    @IsObject()
    coverPhotos: any

    @IsString()
    hostedById: string;

    @IsArray()
    price: any[]

}


