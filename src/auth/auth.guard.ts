import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseGuard } from './base.guard';

@Injectable()
export class AuthGuard extends BaseGuard {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    await this.validateRequest(request); // Just ensure the user is authenticated
    return true;
  }
}
