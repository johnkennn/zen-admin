// users.service.ts 是用户服务的配置文件，用于配置用户服务
// 使用 @Injectable() 装饰器将 UsersService 标记为注入服务
// 使用 @Injectable() 装饰器将 UsersService 模块化，以便在应用程序的任何地方都可以使用
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // 导入 PrismaService 模块
import * as argon2 from 'argon2'; // 导入 argon2 模块
import { Role } from '@prisma/client';

@Injectable() // 将 UsersService 标记为注入服务
export class UsersService {
  constructor(private readonly prisma: PrismaService) {} // 注入 PrismaService 服务

  async createUser(
    email: string,
    username: string,
    password: string,
    role: Role = Role.USER,
  ) {
    const hash = await argon2.hash(password); // 加密密码
    return this.prisma.user.create({
      data: { email, username, password: hash, role }, // 创建用户数据
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      }, // 选择用户数据
    }); // 创建用户
  }

  async validateUser(username: string, password: string) {
    // 验证用户
    const user = await this.prisma.user.findUnique({ where: { username } }); // 查找用户
    if (!user) return null; // 如果用户不存在，返回 null

    const ok = await argon2.verify(user.password, password); // 验证密码
    if (!ok) return null; // 如果密码不正确，返回 null

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt?.toISOString() || undefined,
    }; // 返回用户数据
  } // 验证用户
}
