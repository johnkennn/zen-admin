import { ResponseInterceptor } from './common/interceptors/response.interceptor'; // 导入 ResponseInterceptor 拦截器
import { NestFactory } from '@nestjs/core'; // 导入 NestFactory
import { AppModule } from './app.module'; // 导入 AppModule
import * as net from 'node:net'; // 导入 net 模块
import { ValidationPipe } from '@nestjs/common'; // 导入 ValidationPipe 管道

// 检查端口是否被占用
async function isPortFree(port: number): Promise<boolean> {
  return await new Promise((resolve) => {
    const server = net.createServer(); // 创建服务器
    server.once('error', () => resolve(false)); // 监听错误事件
    server.once('listening', () => server.close(() => resolve(true))); // 监听监听事件
    server.listen(port, '0.0.0.0'); // 监听端口
  });
}

// 查找空闲端口
async function findFreePort(
  preferred: number,
  maxTries = 200,
): Promise<number> {
  for (let i = 0; i <= maxTries; i++) {
    const port = preferred + i; // 计算端口
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found starting from ${preferred}`);
}

// 启动应用
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const preferred =
    Number(process.env.SERVER_PORT) || Number(process.env.PORT) || 3000;
  const port = await findFreePort(preferred, 200);
  app.useGlobalInterceptors(new ResponseInterceptor()); // 使用全局拦截器
  app.useGlobalPipes(
    new ValidationPipe({
      /* 全局管道 */
      whitelist: true, // 去掉 DTO 里未声明的字段
      forbidNonWhitelisted: true, // 有未知字段则 400（可选，练手可先 false）
      transform: true, // 自动把 query/body 转成 DTO 类型（如 number）
      transformOptions: { enableImplicitConversion: true },
    }),
  ); // 使用全局管道，白名单模式
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
}
bootstrap();
