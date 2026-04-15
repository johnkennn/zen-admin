// 导入 Nest 内置工具：给路由/类设置「元数据」
import { SetMetadata } from '@nestjs/common';
// 导入 Prisma 自动生成的角色枚举类型（如 ADMIN / USER）
import type { Role } from '@prisma/client';

// 定义一个唯一的 key（相当于身份证），守卫靠它读取角色信息
export const ROLES_KEY = 'roles';

/**
 * 与 JwtAuthGuard 联用：限制路由角色
 * @param roles 允许访问的角色列表（如 ADMIN, USER）
 */
// 导出一个装饰器函数 @Roles()
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
