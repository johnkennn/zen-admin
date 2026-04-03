// app.module.ts 是应用程序的模块配置文件，用于配置应用程序的模块
// 使用 @Module() 装饰器将 AppModule 模块化，以便在应用程序的任何地方都可以使用
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'; // 提供数据库访问能力（PrismaService）
import { AppController } from './app.controller'; // 导入 AppController 模块
import { AppService } from './app.service'; // 导入 AppService 模块
import { AuthModule } from './auth/auth.module'; // 提供认证能力（AuthService、JwtStrategy、AuthController）
import { UsersModule } from './users/users.module'; // 提供用户领域能力（UsersService）
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';

@Module({
  // 使用 @Module() 装饰器将 AppModule 模块化，以便在应用程序的任何地方都可以使用
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
  ], // 导入 PrismaModule 模块,（全局模块也可以不写 imports，但建议显式声明）, 导入 AuthModule 模块, 导入 UsersModule 模块, 导入 PostsModule 模块, 导入 CategoriesModule 模块, 导入 TagsModule 模块
  controllers: [AppController], // 导入 AppController 模块,（控制器是用于处理请求和响应的模块）
  providers: [AppService], // 导入 AppService 模块,（服务是用于处理业务逻辑的模块）
})
export class AppModule {} // 导出 AppModule 模块,（导出 AppModule 模块，以便在应用程序的任何地方都可以使用）
