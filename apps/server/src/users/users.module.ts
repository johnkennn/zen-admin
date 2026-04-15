// users.module.ts 是 Users 模块的配置文件
// 使用 @Module() 装饰器将 UsersModule 标记为模块
// 使用 UsersService 注册 UsersService
// 使用 UsersService 导出 UsersService
import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesGuard], // 注册 UsersService
  exports: [UsersService], // 导出 UsersService
})
export class UsersModule {} // 导出 UsersModule 模块
