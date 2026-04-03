import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Get,
  ParseIntPipe,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Role } from '@prisma/client';
import { UpdatePostDto } from './dto/update-post.dto';

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
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.postsService.remove(id, req.user.userId);
  }
}
