import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly cookieName = 'auth_token';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async acceptInvite(token: string, password: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token: token.trim() },
    });
    if (!invite) {
      throw new BadRequestException('Invalid or expired invite link');
    }
    if (invite.expiresAt < new Date()) {
      await this.prisma.invite.delete({ where: { id: invite.id } }).catch(() => {});
      throw new BadRequestException('This invite link has expired');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: invite.email,
        passwordHash,
        role: invite.role,
        isActive: true,
      },
    });

    await this.prisma.invite.delete({ where: { id: invite.id } });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.CREATE_USER,
        metadata: `Accepted invite for ${user.email} (role ${user.role})`,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const jwt = await this.jwtService.signAsync(payload, {
      secret: this.getJwtSecret(),
      expiresIn: '7d',
    });
    return { user, token: jwt };
  }

  async register(email: string, password: string) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: Role.VIEWER,
          isActive: true,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.CREATE_USER,
          metadata: `Self-signup for ${user.email}`,
        },
      });

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: this.getJwtSecret(),
        expiresIn: '7d',
      });

      return { user, token };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw err;
    }
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (secret && String(secret).trim()) return secret.trim();
    return 'default-dev-secret-change-in-production';
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.getJwtSecret(),
      expiresIn: '7d',
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.LOGIN,
          metadata: `User ${user.email} logged in`,
        },
      });
    } catch {
      // Don't fail login if audit log fails
    }

    return { user, token };
  }

  async logout(userId: string | null | undefined) {
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: AuditAction.LOGOUT,
          metadata: user ? `User ${user.email} logged out` : undefined,
        },
      });
    }
  }

  getCookieName() {
    return this.cookieName;
  }

  sanitizeUser(user: { passwordHash?: string; [key: string]: unknown }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

