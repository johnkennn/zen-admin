// auth.module.ts 是 Auth 模块的配置文件
// 使用 @Module() 装饰器将 AuthModule 标记为模块
// 使用 JwtModule 注册 JWT 模块
// 使用 AuthController 注册 AuthController
// 使用 AuthService 注册 AuthService
// 使用 JwtStrategy 注册 JwtStrategy
// 使用 UsersModule 导入 UsersModule 模块
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

const jwtExpiresInRaw = process.env.JWT_EXPIRES_IN ?? '7d';
// jwt signOptions.expiresIn 同时支持数字秒与字符串（如 '7d'）。
const jwtExpiresIn =
  /^\d+$/.test(jwtExpiresInRaw)
    ? parseInt(jwtExpiresInRaw, 10)
    : (jwtExpiresInRaw as any);

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // 注册 JWT 模块
      secret: process.env.JWT_SECRET, // 从环境变量中获取 JWT 密钥
      signOptions: {
        // 这里做类型断言是因为来自环境变量的值类型更宽，
        // 但运行时只会传入 number 或 '7d' 这种 StringValue 支持的格式。
        expiresIn: jwtExpiresIn,
      },
    }), // 注册 JWT 模块
    UsersModule, // 导入 UsersModule 模块
  ],
  exports: [PassportModule, JwtModule],
  controllers: [AuthController], // 注册 AuthController
  providers: [AuthService, JwtStrategy], // 注册 AuthService, JwtStrategy
})
export class AuthModule {}
