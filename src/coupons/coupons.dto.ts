import { IsNumber, IsString } from 'class-validator';

export class CreateCouponsDto {
  @IsString()
  code: string;

  @IsNumber()
  discountAmount: number;

  @IsString()
  expiryDate: Date;
}
