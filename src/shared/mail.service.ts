import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { exec } from 'child_process';

try{
    exec("npm run postbuild")
} catch(error){}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // Function to send OTP email
  async sendOtpEmail(email: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your OTP for Verification',
      template:  './otp-template',
      context: {
        otp: otp,
      },
    });
  }

  async sendAccountVerificationEmail(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Account Verification OTP',
        template: './account-verification', // Path is relative to templates folder
        context: {
          otp, // This will be passed to the Pug template
        },
      });
      console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
    }
  }
}
