import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateAmenitiesDto {
  @ApiProperty({ example: 'home', description: 'Icon name' })
  @IsString()
  icon: string;

  @ApiProperty({ example: 'Home', description: 'Label text' })
  @IsString()
  label: string;

  @ApiProperty({ example: true, description: 'Active status', default: true })
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAmenitiesDto extends CreateAmenitiesDto{}
