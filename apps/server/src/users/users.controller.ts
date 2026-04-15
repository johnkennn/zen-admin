import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UsersService } from './users.service';

type AuthedRequest = Request & {
  user: { userId: string; username: string; role: Role };
};

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: AdminCreateUserDto) {
    return this.usersService.createUser(
      dto.email,
      dto.username,
      dto.password,
      dto.role ?? Role.USER,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.usersService.removeUser(id, req.user.userId);
  }
}
