import { BadRequestException } from '@nestjs/common';

/** 小写存储、去掉所有空白字符（含中间空格） */
export function normalizeStoredName(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!s) throw new BadRequestException('名称不能为空');
  return s;
}
