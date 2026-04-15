import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';

class CreateUserDto {
  email: string;
  password: string;
  role?: Role;
}

class InviteUserDto {
  email: string;
  role?: Role;
  sendEmail?: boolean;
}

class UpdateUserDto {
  role?: Role;

  isActive?: boolean;
}

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Req() req: Request, @Body() body: CreateUserDto) {
    const actor = (req as any).user as { id: string };
    return this.usersService.createUser({
      email: body.email,
      password: body.password,
      role: body.role,
      actorId: actor.id,
    });
  }

  @Post('invite')
  async createInvite(@Req() req: Request, @Body() body: InviteUserDto) {
    const actor = (req as any).user as { id: string };
    return this.usersService.createInvite({
      email: body.email,
      role: body.role,
      sendEmail: body.sendEmail === true,
      actorId: actor.id,
    });
  }

  @Get()
  async listUsers() {
    return this.usersService.listUsers();
  }

  @Patch(':id')
  async updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    const actor = (req as any).user as { id: string };
    return this.usersService.updateUser({
      id,
      role: body.role,
      isActive: body.isActive,
      actorId: actor.id,
    });
  }
}

