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

/** 控制器已返回统一包体时不再二次包裹，避免登录等业务自定义 code 被盖成 200 */
function isPlainApiResponse(data: unknown): data is {
  code: number;
  data: unknown;
  message: string;
} {
  if (data === null || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.code === 'number' &&
    'data' in o &&
    typeof o.message === 'string'
  );
}

@Injectable() // 将 ResponseInterceptor 标记为注入服务
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  // 拦截请求
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    // 拦截请求
    return next.handle().pipe(
      map((data) => {
        if (isPlainApiResponse(data)) return data;
        return {
          code: 200, // 状态码
          data, // 数据
          message: 'success', // 消息
        };
      }),
    );
  }
}
