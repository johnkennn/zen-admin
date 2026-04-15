import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@packages/shared';

// 你可以按需改成 import.meta.env.VITE_API_BASE_URL
const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

function onUnauthorized() {
  localStorage.removeItem('accessToken');
  // 简化版：直接跳转；如果你用 vue-router，再换成 router.push('/login')
  window.location.href = '/login';
}

/**
 * 统一解析接口错误文案：Nest 校验失败时 message 常为 string[]，业务 reject 体为 { message: string }
 */
export function getApiErrorMessage(err: unknown, fallback = '请求失败'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (data?.message != null) {
      const m = data.message;
      return Array.isArray(m) ? m.join('; ') : String(m);
    }
    if (err.message) return err.message;
    return fallback;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (Array.isArray(m)) return m.join('; ');
    if (typeof m === 'string' && m) return m;
  }
  return fallback;
}

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// 请求拦截器：注入 Authorization
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理业务 code + HTTP 错误
http.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse<unknown> | unknown;
    if (typeof body === 'object' && body && 'code' in (body as any)) {
      const code = (body as any).code;
      if (code === 401) onUnauthorized();
    }
    // 这里不要改变返回类型，保持 AxiosResponse
    return res;
  },
  (err: AxiosError) => {
    const status = err.response?.status;

    if (status === 401) onUnauthorized();
    if (status && status >= 500) {
      alert('服务器错误，请稍后重试');
    }

    return Promise.reject(err);
  },
);

// 泛型请求：返回值自动变成 ApiResponse<T>
export async function request<T>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await http.request<ApiResponse<T>>(config);
  const body = res.data;

  if (body?.code === 200) return body;
  if (body?.code === 401) onUnauthorized();

  return Promise.reject(body);
}

// 更常用的：直接拿 data（T）
export async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await request<T>(config);
  return res.data;
}
