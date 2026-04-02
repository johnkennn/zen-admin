import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common'; // 导入控制器和Post请求
import { AuthService } from './auth.service'; // 导入AuthService
import { LoginDto } from './dto/login.dto'; // 导入LoginDto
import type { UserLoginResponse } from '@packages/shared';
import type { Request } from 'express';
import type { MenuItem } from '@packages/shared';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth') // 将AuthController标记为控制器
export class AuthController {
  constructor(private readonly authService: AuthService) {} // 注入AuthService

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<UserLoginResponse> {
    // 登录
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
