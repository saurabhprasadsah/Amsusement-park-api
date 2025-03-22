import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgetPasswordDto, LoginDto, SignupDto, VerifyAuthTokenDto, VerifyOtpDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() userDto: SignupDto) {
    return this.authService.signup(userDto);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    console.log('body', body);
    return this.authService.login(body.email, body.password);
  }

  @Post('verify-auth-token')
  async verifyAuthToken(@Body() body: VerifyAuthTokenDto) {
    return this.authService.verifyAuthToken(body.authToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgetPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.otp, body.forgetJwtToken);
  }

  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body);
  }
}