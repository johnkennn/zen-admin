// auth.module.ts 是 Auth 模块的配置文件
// 使用 @Module() 装饰器将 AuthModule 标记为模块
// 使用 JwtModule 注册 JWT 模块
// 使用 AuthController 注册 AuthController
// 使用 AuthService 注册 AuthService
// 使用 JwtStrategy 注册 JwtStrategy
// 使用 UsersModule 导入 UsersModule 模块
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      // 注册 JWT 模块
      secret: process.env.JWT_SECRET, // 从环境变量中获取 JWT 密钥
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '7d'), // 从环境变量中获取 JWT 过期时间, 转换为秒
      },
    }), // 注册 JWT 模块
    UsersModule, // 导入 UsersModule 模块
  ],
  controllers: [AuthController], // 注册 AuthController
  providers: [AuthService, JwtStrategy], // 注册 AuthService, JwtStrategy
})
export class AuthModule {}
