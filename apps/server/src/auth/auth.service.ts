import { Injectable, UnauthorizedException } from '@nestjs/common'; // 导入注入服务和授权异常401错误
import { JwtService } from '@nestjs/jwt'; // 导入 JwtService 模块，用于签发 Token
import { UsersService } from '../users/users.service'; // 导入 UsersService 模块，用于验证用户
import type { MenuItem, UserLoginResponse, UserRole } from '@packages/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable() // 将 AuthService 标记为注入服务
export class AuthService {
  constructor(
    // 注入 UsersService 和 JwtService
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(username: string, password: string): Promise<UserLoginResponse> {
    // 1. 验证用户
    const user = await this.usersService.validateUser(username, password);

    // 2. 用户不存在/密码错误 → 直接抛401
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 3. 生成 JWT 载荷（存放非敏感信息）
    const payload = {
      sub: user.id, // 标准：subject = 用户ID
      username: user.username,
      role: user.role, // 角色，用于后面权限控制
    };

    // 4. 异步签发 Token
    const accessToken = await this.jwtService.signAsync(payload);

    // 5. 返回给前端
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role, // 这里最好让 shared 的 UserRole 和后端 role 保持同名
        createdAt: user.createdAt ?? undefined, // 创建时间, 转换为 ISO 字符串, 如果为空, 则返回 undefined
      },
      accessToken, // 登录令牌
    };
  }
  async getMenu(role: UserRole): Promise<MenuItem[]> {
    // 1) 取出当前角色可访问的菜单（只拉必要字段）
    const menus = await this.prisma.menu.findMany({
      where: {
        roles: {
          some: {
            role: role as any,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { sort: 'asc' }],
      select: {
        id: true,
        name: true,
        path: true,
        icon: true,
        component: true,
        parentId: true,
        affix: true,
      },
    });

    // 2) 组装成树（children）
    const byId = new Map<string, MenuItem & { parentId?: string | null }>();
    for (const m of menus) {
      byId.set(m.id, {
        id: m.id,
        name: m.name,
        path: m.path,
        icon: m.icon ?? undefined,
        component: m.component ?? undefined,
        children: [],
        parentId: m.parentId ?? null,
        affix: m.affix ?? false,
      });
    }

    const roots: MenuItem[] = [];
    for (const node of byId.values()) {
      const parentId = (node as any).parentId as string | null;
      if (parentId && byId.has(parentId)) {
        (byId.get(parentId)!.children ||= []).push(node);
      } else {
        roots.push(node);
      }
    }

    // 3) 清理临时字段，保持返回结构稳定
    const strip = (items: any[]): MenuItem[] =>
      items.map((i) => ({
        id: i.id,
        name: i.name,
        path: i.path,
        icon: i.icon,
        component: i.component,
        children: i.children?.length ? strip(i.children) : undefined,
      }));

    return strip(roots);
  }
}
