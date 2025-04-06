import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Auth, AuthDocument, OtpType, Status } from '../schemas/auth.schema';
import {
  AUTH_TOKEN_KEY,
  FORGET_JWT_KEY,
  JWT_ALGO,
  SESSION_TOKEN_KEY,
} from 'src/config/constants';
import { ChangePasswordDto, SignupDto } from './auth.dto';
import { Role } from './role.enum';
import { MailService } from 'src/shared/mail.service';
import { v4 as uuid } from 'uuid'
require('dotenv').config();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(userDto: any, role: Role) {
    try {
      const user = await this.authModel.findOne({ email: userDto.email });
      if (user) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const salt = await bcrypt.genSalt(15);
      userDto.password = await bcrypt.hash(userDto.password, salt);
      userDto.role = role;
      userDto.status = Status.Active;
      await this.authModel.create(userDto);
      return { success: true, message: role + ' signup successful.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async login(email: string, password: string) {
    const user = await this.authModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const sessionToken = this.jwtService.sign(
      { _id: user._id, role: user.role, isVerified: user.isVerified, email: user.email, name: user.name },
      { secret: SESSION_TOKEN_KEY, expiresIn: '1h' },
    );
    const authToken = this.jwtService.sign(
      { _id: user._id, isVerified: user.isVerified, role: user.role, name: user.name },
      { secret: AUTH_TOKEN_KEY, expiresIn: '30d' },
    );
    return { sessionToken, authToken };
  }

  async verifyAuthToken(authToken: string) {
    try {
      const decoded = this.jwtService.verify(authToken, {
        secret: AUTH_TOKEN_KEY,
      });
      const user = await this.authModel.findById(decoded._id);
      if (decoded && user) {
        const sessionToken = this.jwtService.sign(
          { _id: user._id, role: user.role, isVerified: user.isVerified, email: user.email, name: user.name },
          { secret: SESSION_TOKEN_KEY, expiresIn: '1h' },
        );
        return { sessionToken };
      }
      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  async throttleCheck(email: string, otpType: OtpType) {}

  async forgotPassword(email: string) {
    try {
      const user = await this.authModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      await this.throttleCheck(user.email, OtpType.ForgetPassword);

      const otp = this.generateOtp();
      user.otpInfo.push({
        _id: new mongoose.Types.ObjectId(),
        timestamp: new Date(),
        otp,
        otpType: OtpType.ForgetPassword,
      });
      await user.save();

      const forgetJwtToken = this.jwtService.sign(
        { email },
        { secret: FORGET_JWT_KEY, expiresIn: '15m' },
      );

      try {
        await this.mailService.sendOtpEmail(user.email, otp);
      } catch (error) {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      return { message: 'OTP sent successfully', forgetJwtToken };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Verify OTP (and also verify FORGET_JWT_KEY token)
  async verifyOtp(email: string, otp: string, forgetJwtToken: string) {
    try {
      const decoded = this.jwtService.verify(forgetJwtToken, {
        secret: FORGET_JWT_KEY,
      });

      if (decoded.email !== email) {
        throw new UnauthorizedException('Invalid token for this email');
      }

      const user = await this.authModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      let latestOtpEntry: any[] = user.otpInfo.filter((i) => {
        return i.otpType == OtpType.ForgetPassword;
      });

      if (latestOtpEntry.length === 0) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }

      const lastOtp = latestOtpEntry[latestOtpEntry.length - 1];
      if (!lastOtp || lastOtp.isVerified || lastOtp.otp != otp) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }
      const otpIndex = user.otpInfo.findIndex((i)=> i._id === lastOtp._id)
      user.otpInfo[otpIndex].isVerified = true;
      await user.save();

      return { message: 'OTP verified successfully', success: true };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(dto: ChangePasswordDto) {
    const { email, newPassword, token: forgetJwtToken } = dto;

    let isDecoded1Verified = false;
    let isDecoded2Verified = false;

    try {
      const decoded1 = this.jwtService.verify(forgetJwtToken, {
        secret: FORGET_JWT_KEY,
      });

      if (decoded1.email === email) isDecoded1Verified = true;
    } catch (error) {}

    try {
      const decoded2 = this.jwtService.verify(forgetJwtToken, {
        secret: SESSION_TOKEN_KEY,
      });
      if (decoded2.email === email) isDecoded2Verified = true;
    } catch (error) {}

    if (!isDecoded1Verified && !isDecoded2Verified) {
      throw new UnauthorizedException();
    }

    const user = await this.authModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.otpInfo[user.otpInfo.length - 1].isVerified === false) {
      throw new UnauthorizedException('OTP not verified');
    }

    const salt = await bcrypt.genSalt(15);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async checkUserInfo(userId: string, basicInfo: boolean) {
    if (basicInfo) {
      const result = await this.authModel
        .findById(userId)
        .select('name email phone role description')
        .lean();
      return result;
    }
    const result = await this.authModel.findById(userId).lean();
    return result;
  }

  async sendAccountVerificationOtp(userId: string) {
    try {
      const user = await this.authModel.findById(userId);
      if (!user) throw new BadRequestException();
      await this.throttleCheck(user.email, OtpType.VerifyAccount);

      const otp = this.generateOtp();

      user.otpInfo.push({
        _id: new mongoose.Types.ObjectId(),
        timestamp: new Date(),
        otp,
        otpType: OtpType.VerifyAccount,
      });

      await user.save();
      
      try {
        await this.mailService.sendAccountVerificationEmail(user.email, otp);
      } catch (error) {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      return { message: 'OTP sent successfully', success: true };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyAccount(userId: string, otp: string) {
    const findUser = await this.authModel
      .findById(userId)
      .lean();

    if (findUser) {

      const otps = findUser.otpInfo.filter((i)=> i.otpType === OtpType.VerifyAccount);
      const latestOtpEntry = otps[otps.length - 1];
      if (
        !latestOtpEntry ||
        latestOtpEntry.isVerified ||
        latestOtpEntry.otp != otp
      ) {
        throw new UnauthorizedException('Invalid OTP');
      }
      const otpIndex = findUser.otpInfo.findIndex((i)=> latestOtpEntry._id === i._id)

      findUser.otpInfo[otpIndex].isVerified = true;

      await this.authModel.findByIdAndUpdate(userId, {
        otpInfo: findUser.otpInfo,
        isVerified: true
      });

      const sessionToken = this.jwtService.sign(
        { _id: findUser._id, role: findUser.role, isVerified: findUser.isVerified, email: findUser.email },
        { secret: SESSION_TOKEN_KEY, expiresIn: '1d' },
      );
      const authToken = this.jwtService.sign(
        { _id: findUser._id, isVerified: findUser.isVerified, role: findUser.role },
        { secret: AUTH_TOKEN_KEY, expiresIn: '30d' },
      );

      return { sessionToken,authToken, message: 'OTP verified successfully', success: true };
    } else throw new BadRequestException();
  }

  async logHistory(propertyId: string, userId: string) {
    const user = await this.authModel.findById(userId)
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if(!user.propertyHistory){
      user.propertyHistory = [propertyId]
    } else {
      user.propertyHistory.push(propertyId)
    }
    await user.save();
    return { message: 'History logged successfully', success: true };
  }
}
