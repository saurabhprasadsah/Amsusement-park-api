import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SESSION_TOKEN_KEY } from 'src/config/constants';

export abstract class BaseGuard implements CanActivate {
  constructor(protected jwtService: JwtService) {}

  async validateRequest(request: Request): Promise<any> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = this.jwtService.verify(token, { secret: SESSION_TOKEN_KEY });
      request.user = user; // ✅ Attach user to request
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  abstract canActivate(context: ExecutionContext): Promise<boolean>;
}
