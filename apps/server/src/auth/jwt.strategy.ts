// jwt.strategy.ts 是 JWT 认证策略的配置文件
// 使用 @Injectable() 装饰器将 JwtStrategy 标记为注入服务
// 使用 PassportStrategy 基类继承 Strategy 类，实现 JWT 认证策略
import { Injectable } from '@nestjs/common'; // 导入注入服务
import { PassportStrategy } from '@nestjs/passport'; // Nest 封装的认证基类
import { ExtractJwt, Strategy } from 'passport-jwt'; //ExtractJwt：从请求头提取 Token,Strategy：JWT 验证策略
import { Role } from '@prisma/client';

type JwtPayload = {
  // JWT 载荷类型
  sub: string;
  username: string;
  role: Role;
};

@Injectable() // 将 JwtStrategy 标记为注入服务
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 继承 PassportStrategy 基类
  constructor() {
    // 构造函数
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头提取 Token
      secretOrKey: process.env.JWT_SECRET as string, // 从环境变量中获取 JWT 密钥
      ignoreExpiration: false, // 不忽略过期时间
    });
  }

  async validate(payload: JwtPayload) {
    // 验证 JWT 载荷
    // 这里的返回值会挂到 req.user, 用于后续请求的权限控制
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
