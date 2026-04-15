import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { basename, join } from 'node:path';

/** 与 main.ts 静态前缀、存储子目录一致 */
export const POST_COVER_PUBLIC_PREFIX = '/uploads/posts/';

export function getPostCoversUploadDir(): string {
  return join(process.cwd(), 'uploads', 'posts');
}

/** 确保目录存在（同步，启动上传前调用） */
export function ensurePostCoversDir(): void {
  const dir = getPostCoversUploadDir();
  mkdirSync(dir, { recursive: true });
}

/**
 * 根据对外 URL 删除磁盘文件；仅处理本目录下的直链文件，防止路径穿越
 */
export function tryUnlinkPostCoverByUrl(
  publicUrl: string | null | undefined,
): void {
  if (!publicUrl?.startsWith(POST_COVER_PUBLIC_PREFIX)) return;
  const name = publicUrl.slice(POST_COVER_PUBLIC_PREFIX.length);
  if (!name || name !== basename(name) || name.includes('..')) return;
  const abs = join(getPostCoversUploadDir(), name);
  const root = getPostCoversUploadDir();
  if (!abs.startsWith(root)) return;
  if (existsSync(abs)) {
    try {
      unlinkSync(abs);
    } catch {
      /* 忽略删除失败，避免影响主流程 */
    }
  }
}

/** 可选：写入 DB 前校验前端只能提交本服务生成的路径 */
export function isAllowedPostCoverUrl(
  url: string | null | undefined,
): boolean {
  if (url === undefined || url === '' || url === null) return true;
  if (!url.startsWith(POST_COVER_PUBLIC_PREFIX)) return false;
  const name = url.slice(POST_COVER_PUBLIC_PREFIX.length);
  if (!name || name !== basename(name) || name.includes('..')) return false;
  return true;
}
