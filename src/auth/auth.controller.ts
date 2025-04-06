import { Controller, Post, Body, UseGuards, Req, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  SignupDto,
  VerifyAccountOtpDto,
  VerifyAuthTokenDto,
  VerifyOtpDto,
} from './auth.dto';
import { Role } from './role.enum';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() userDto: SignupDto) {
    return this.authService.signup(userDto, Role.User);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('signup-vendor')
  async signupVendor(@Body() userDto: SignupDto) {
    return this.authService.signup(userDto, Role.Vendor);
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
    return this.authService.verifyOtp(
      body.email,
      body.otp,
      body.forgetJwtToken,
    );
  }

  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body);
  }

  @Post('send-account-verification-mail')
  @Roles(Role.User, Role.Vendor)
  @UseGuards(AuthGuard, RolesGuard)
  async sendAccountVerificationOtp(@Req() req) {
    return this.authService.sendAccountVerificationOtp(req.user._id);
  }

  @Post('verify-email')
  @Roles(Role.User, Role.Vendor)
  @UseGuards(AuthGuard, RolesGuard)
  async verifyAccount(@Body() body: VerifyAccountOtpDto, @Req() req) {
    return this.authService.verifyAccount(req.user._id, body.otp);
  }

  @Post('update-user-info')
  async updateUserInfo() {}

  @Get('log-history')
  @Roles(Role.User, Role.Vendor)
  @UseGuards(RolesGuard)
  async logHistory(
    @Query('propertyId') propertyId: string,
    @Req() req: any,
  ) {
    return this.authService.logHistory(propertyId, req.user._id);
  }
}
