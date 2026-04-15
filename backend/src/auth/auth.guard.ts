import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly cookieName = 'auth_token';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[this.cookieName];

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const secret =
        process.env.JWT_SECRET?.trim() || 'default-dev-secret-change-in-production';
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(token, { secret });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Attach user to request for downstream handlers/guards
      (request as any).user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}

