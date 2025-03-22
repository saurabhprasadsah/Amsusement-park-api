import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

export abstract class BaseGuard implements CanActivate {
  constructor(protected jwtService: JwtService) {}

  async validateRequest(request: Request): Promise<any> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    return this.jwtService.verifyAsync(token);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  abstract canActivate(context: ExecutionContext): Promise<boolean>;
}
