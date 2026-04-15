// 导入 Nest 守卫、执行上下文、依赖注入装饰器
import {
  CanActivate, // 守卫必须实现的接口
  ExecutionContext, // 执行上下文（获取请求、路由信息）
  Injectable, // 依赖注入装饰器
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // 反射器：读取装饰器元数据
import type { Role } from '@prisma/client'; // Prisma 生成的角色枚举类型
import { ROLES_KEY } from './roles.decorator'; // 角色装饰器的唯一 key

// 注入式守卫（可以在构造函数注入 Reflector）
@Injectable()
// 实现 CanActivate 接口 → 必须写 canActivate 方法
export class RolesGuard implements CanActivate {
  // 构造函数注入 Reflector（读取装饰器元数据）
  constructor(private readonly reflector: Reflector) {}

  // 核心方法：返回 true 放行，返回 false 拦截
  canActivate(context: ExecutionContext): boolean {
    // 1. 从 控制器方法 / 控制器类 上读取需要的角色
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // 优先读取【方法上】的角色装饰器
      context.getClass(), // 方法没有就读取【类上】的角色装饰器
    ]);

    // 2. 如果接口没有设置角色要求 → 直接放行（公共接口）
    if (!required?.length) return true;

    // 3. 获取 HTTP 请求对象（从执行上下文切换到 HTTP 上下文）
    const req = context.switchToHttp().getRequest<{
      user?: { role?: Role }; // 类型定义：请求里带 user，user 带 role
    }>();

    // 4. 拿到当前登录用户的角色
    const role = req.user?.role;

    // 5. 校验：用户有角色 + 角色在允许列表内 → 放行
    return !!role && required.includes(role);
  }
}
