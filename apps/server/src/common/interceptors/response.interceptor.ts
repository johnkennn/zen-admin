// response.interceptor.ts 是响应拦截器的配置文件
// 使用 @Injectable() 装饰器将 ResponseInterceptor 标记为注入服务
// 使用 NestInterceptor 接口实现响应拦截器

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable() // 将 ResponseInterceptor 标记为注入服务
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  // 拦截请求
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    // 拦截请求
    return next.handle().pipe(
      map((data) => ({
        code: 200, // 状态码
        data, // 数据
        message: 'success', // 消息
      })),
    );
  }
}
