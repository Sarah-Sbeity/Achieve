import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

class LoginDto {
  email: string;
  password: string;
}

class SignupDto {
  email: string;
  password: string;
}

class AcceptInviteDto {
  token: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;
    const { user, token } = await this.authService.login(email, password);

    const cookieName = this.authService.getCookieName();
    res.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return this.authService.sanitizeUser(user);
  }

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body() body: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;
    const { user, token } = await this.authService.register(email, password);

    const cookieName = this.authService.getCookieName();
    res.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return this.authService.sanitizeUser(user);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieName = this.authService.getCookieName();
    const user = (req as any).user as { id?: string } | undefined;

    res.clearCookie(cookieName, { path: '/' });

    await this.authService.logout(user?.id);

    return { success: true };
  }

  @Post('accept-invite')
  @HttpCode(200)
  async acceptInvite(
    @Body() body: AcceptInviteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, password } = body;
    const { user, token: jwt } = await this.authService.acceptInvite(
      token,
      password,
    );

    const cookieName = this.authService.getCookieName();
    res.cookie(cookieName, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return this.authService.sanitizeUser(user);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user = (req as any).user as Record<string, unknown>;
    return this.authService.sanitizeUser(user);
  }
}

