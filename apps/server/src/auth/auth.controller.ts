import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { ApiResponse, MenuItem, UserLoginResponse } from '@packages/shared';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth') // 将AuthController标记为控制器
export class AuthController {
  constructor(private readonly authService: AuthService) {} // 注入AuthService

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
  ): Promise<ApiResponse<UserLoginResponse | null>> {
    return await this.authService.login(dto.username, dto.password);
  }
  // 获取菜单
  @Get('menu')
  @UseGuards(JwtAuthGuard)
  async menu(@Req() req: Request): Promise<MenuItem[]> {
    const role = (req as any).user?.role ?? 'USER';
    return await this.authService.getMenu(role);
  }
}
