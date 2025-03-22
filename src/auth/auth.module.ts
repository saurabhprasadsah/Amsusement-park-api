import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth, AuthSchema } from '../schemas/auth.schema';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService,
    
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],

})
export class AuthModule {}