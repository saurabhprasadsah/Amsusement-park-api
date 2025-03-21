import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Auth } from './auth.schema';
import {
  AUTH_TOKEN_KEY,
  JWT_ALGO,
  SESSION_TOKEN_KEY,
} from 'src/config/constants';
import { ChangePasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) {}

  async signup(userDto: any) {
    const salt = await bcrypt.genSalt(15);
    userDto.password = await bcrypt.hash(userDto.password, salt);
    return this.authModel.create(userDto);
  }

  async login(email: string, password: string) {
    const user = await this.authModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const sessionToken = this.jwtService.sign(
      { id: user._id, role: user.role },
      { secret: SESSION_TOKEN_KEY, expiresIn: '3h' },
    );
    const authToken = this.jwtService.sign(
      { id: user._id },
      { secret: AUTH_TOKEN_KEY, expiresIn: '30d' },
    );
    return { sessionToken, authToken };
  }

  async verifyAuthToken(authToken: string) {
    try {
      const decoded = this.jwtService.verify(authToken, {
        secret: AUTH_TOKEN_KEY,
      });
      const validUser = await this.authModel.findById(decoded._id);
      if (decoded && validUser) {
        const sessionToken = this.jwtService.sign(
          { id: decoded.id, role: decoded.role },
          { secret: SESSION_TOKEN_KEY, expiresIn: '1h' },
        );
        return { sessionToken };
      }
      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.authModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate OTP if not already generated
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpInfo.push({ timestamp: new Date(), otp });
    await user.save();

    // Generate FORGET_JWT_KEY token
    const forgetJwtToken = this.jwtService.sign(
      { email },
      { secret: process.env.FORGET_JWT_KEY, expiresIn: '15m' }, // Token expires in 15 minutes
    );

    // Send OTP to user's email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-email-password',
        },
      });
      await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`,
      });
    } catch (error) {}

    return { message: 'OTP sent successfully', forgetJwtToken }; // Return token to user
  }

  // Verify OTP (and also verify FORGET_JWT_KEY token)
  async verifyOtp(email: string, otp: string, forgetJwtToken: string) {
    try {
      // Verify the FORGET_JWT_KEY token
      const decoded = this.jwtService.verify(forgetJwtToken, {
        secret: process.env.FORGET_JWT_KEY,
      });

      if (decoded.email !== email) {
        throw new UnauthorizedException('Invalid token for this email');
      }

      const user = await this.authModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const latestOtpEntry = user.otpInfo[user.otpInfo.length - 1];
      if (!latestOtpEntry || latestOtpEntry.otp !== otp) {
        throw new UnauthorizedException('Invalid OTP');
      }

      return { message: 'OTP verified successfully', success: true };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(dto: ChangePasswordDto) {
    const { email, newPassword, forgetJwtToken } = dto;

    try {
      const decoded = this.jwtService.verify(forgetJwtToken, {
        secret: process.env.FORGET_JWT_KEY,
      });

      if (decoded.email !== email) {
        throw new UnauthorizedException('Invalid token for this email');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.authModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const salt = await bcrypt.genSalt(15);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
