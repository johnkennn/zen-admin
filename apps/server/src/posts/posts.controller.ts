import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Role } from '@prisma/client';
import { UpdatePostDto } from './dto/update-post.dto';
import { postCoverDiskStorage } from './post-cover.multer';
import { POST_COVER_PUBLIC_PREFIX } from './post-file.util';

type AuthedRequest = Request & {
  user: { userId: string; username: string; role: Role };
};

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto, @Req() req: AuthedRequest) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  /** 上传帖子封面（磁盘存储），返回可写入 coverUrl 的相对路径 */
  @Post('cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: postCoverDiskStorage,
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
          cb(new BadRequestException('仅支持 jpeg / png / webp / gif'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadCover(@UploadedFile() file: Express.Multer.File) {
    if (!file?.filename) {
      throw new BadRequestException('请选择图片文件');
    }
    return {
      url: `${POST_COVER_PUBLIC_PREFIX}${file.filename}`,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: AuthedRequest,
  ) {
    return this.postsService.update(
      id,
      updatePostDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.postsService.remove(id, req.user.userId, req.user.role);
  }
}
