import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // 导入 JwtService 模块，用于签发 Token
import { UsersService } from '../users/users.service'; // 导入 UsersService 模块，用于验证用户
import type {
  ApiResponse,
  MenuItem,
  UserLoginResponse,
  UserRole,
} from '@packages/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable() // 将 AuthService 标记为注入服务
export class AuthService {
  constructor(
    // 注入 UsersService 和 JwtService
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /** HTTP 由控制器固定为 200，成功/失败用业务 code 区分（失败勿用 401，以免与「未登录」语义及前端全局处理冲突） */
  async login(
    username: string,
    password: string,
  ): Promise<ApiResponse<UserLoginResponse | null>> {
    const user = await this.usersService.validateUser(username, password);

    if (!user) {
      return {
        code: 400,
        message: 'Invalid credentials',
        data: null,
      };
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      code: 200,
      message: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt ?? undefined,
        },
        accessToken,
      },
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
