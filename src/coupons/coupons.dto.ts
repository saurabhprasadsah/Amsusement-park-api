import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateCouponsDto {

  @IsNumber()
  discountAmountFlat: number;

  @IsString()
  expiryDate: string;

  @IsArray()
  properties: string[];

  @IsNumber()
  minimumAmount: number;

  @IsString()
  email: string;

  @IsBoolean()
  canBeUsedAnyUser: boolean;
}
