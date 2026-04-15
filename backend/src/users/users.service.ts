import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuditAction, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserParams {
  email: string;
  password: string;
  role?: Role;
  actorId: string;
}

interface CreateInviteParams {
  email: string;
  role?: Role;
  sendEmail?: boolean;
  actorId: string;
}

interface UpdateUserParams {
  id: string;
  role?: Role;
  isActive?: boolean;
  actorId: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(params: CreateUserParams) {
    const { email, password, role, actorId } = params;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role ?? Role.VIEWER,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: AuditAction.CREATE_USER,
        metadata: `Created user ${email} with role ${user.role}`,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async createInvite(
    params: CreateInviteParams,
  ): Promise<{ token: string; inviteLink: string; emailSent?: boolean; emailError?: string }> {
    const { email, role, sendEmail, actorId } = params;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const existingInvite = await this.prisma.invite.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingInvite) {
      if (existingInvite.expiresAt > new Date()) {
        const baseUrl = process.env.FRONTEND_URL || '';
        const inviteLink = baseUrl
          ? `${baseUrl.replace(/\/$/, '')}/invite?token=${existingInvite.token}`
          : '';
        return { token: existingInvite.token, inviteLink };
      }
      await this.prisma.invite.delete({ where: { id: existingInvite.id } });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.invite.create({
      data: {
        email: normalizedEmail,
        role: role ?? Role.VIEWER,
        token,
        expiresAt,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: AuditAction.CREATE_USER,
        metadata: `Invite sent to ${normalizedEmail} with role ${role ?? Role.VIEWER}`,
      },
    });

    const baseUrl = process.env.FRONTEND_URL || '';
    const inviteLink = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}/invite?token=${token}`
      : '';

    let emailSent = false;
    let emailError: string | undefined;
    if (sendEmail) {
      const linkToSend = inviteLink || (baseUrl ? `${baseUrl.replace(/\/$/, '')}/invite?token=${token}` : '');
      if (!linkToSend) {
        emailError = 'Set FRONTEND_URL in .env to send invite links by email.';
      } else {
        const adminUser = await this.prisma.user.findUnique({
          where: { id: actorId },
          select: { email: true },
        });
        const fromEmail = adminUser?.email || process.env.SMTP_FROM || process.env.SMTP_USER;
        const result = await this.sendInviteEmail(normalizedEmail, linkToSend, fromEmail);
        emailSent = result.sent;
        emailError = result.error;
      }
    }

    return { token, inviteLink, emailSent, emailError };
  }

  private async sendInviteEmail(
    to: string,
    inviteLink: string,
    fromEmail?: string | null,
  ): Promise<{ sent: boolean; error?: string }> {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = fromEmail?.trim() || process.env.SMTP_FROM || user || 'noreply@survey.local';
    if (!host || !user || !pass) {
      return { sent: false, error: 'Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env' };
    }
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: from,
        to,
        replyTo: fromEmail?.trim() || undefined,
        subject: 'You\'re invited to the Survey Platform',
        text: `You have been invited to join. Set your password by opening this link (valid 7 days):\n\n${inviteLink}`,
        html: `<p>You have been invited to join the Survey Platform.</p><p><a href="${inviteLink}">Set your password here</a> (link valid 7 days).</p>`,
      });
      return { sent: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send email';
      return { sent: false, error: message };
    }
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return users.map(({ passwordHash, ...rest }) => rest);
  }

  async updateUser(params: UpdateUserParams) {
    const { id, role, isActive, actorId } = params;

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.UserUpdateInput = {};
    const auditActions: AuditAction[] = [];
    const auditMessages: string[] = [];

    if (role && role !== existing.role) {
      data.role = role;
      auditActions.push(AuditAction.UPDATE_USER_ROLE);
      auditMessages.push(
        `Updated role for user ${existing.email} from ${existing.role} to ${role}`,
      );
    }

    if (typeof isActive === 'boolean' && isActive !== existing.isActive) {
      data.isActive = isActive;
      if (!isActive) {
        auditActions.push(AuditAction.DEACTIVATE_USER);
        auditMessages.push(`Deactivated user ${existing.email}`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    await Promise.all(
      auditActions.map((action, index) =>
        this.prisma.auditLog.create({
          data: {
            userId: actorId,
            action,
            metadata: auditMessages[index],
          },
        }),
      ),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = updated;
    return rest;
  }
}

