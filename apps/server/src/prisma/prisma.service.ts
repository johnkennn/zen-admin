import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; // 导入 dotenv 配置

@Injectable() // 将 PrismaService 标记为注入服务
// 继承 PrismaClient
// 实现 OnModuleInit 和 OnModuleDestroy 接口
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 在模块初始化时连接数据库
  async onModuleInit() {
    await this.$connect(); // 连接数据库
  }
  // 在模块销毁时断开数据库连接
  async onModuleDestroy() {
    await this.$disconnect(); // 断开数据库连接
  }
}
