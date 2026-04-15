import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { ensurePostCoversDir, getPostCoversUploadDir } from './post-file.util';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const postCoverDiskStorage = diskStorage({
  destination(_req, _file, cb) {
    ensurePostCoversDir();
    cb(null, getPostCoversUploadDir());
  },
  filename(_req, file, cb) {
    const ext = extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      cb(
        new BadRequestException('仅支持 jpg / png / webp / gif 图片'),
        '',
      );
      return;
    }
    cb(null, `${randomUUID()}${ext}`);
  },
});
