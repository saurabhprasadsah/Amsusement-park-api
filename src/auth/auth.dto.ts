import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  phone: number;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class VerifyAuthTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  authToken: string;
}

export class ForgetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  forgetJwtToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(6)
  @Max(6)
  otp: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be at least 8 characters long' })
  @MaxLength(20, { message: 'Password should be at most 20 characters long' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    },
  )
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  forgetJwtToken:string
}
