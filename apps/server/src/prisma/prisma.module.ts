// prisma.module.ts 是 prisma 模块的配置文件，用于配置 prisma 模块
// 使用 @Global() 装饰器将 PrismaService 标记为全局服务，以便在应用程序的任何地方都可以使用
// 使用 @Module() 装饰器将 PrismaService 模块化，以便在应用程序的任何地方都可以使用
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 将 PrismaService 标记为全局服务
@Module({
  // 提供 PrismaService 服务
  providers: [PrismaService],
  // 导出 PrismaService 服务
  exports: [PrismaService],
})
export class PrismaModule {} // 导出 PrismaModule 模块
