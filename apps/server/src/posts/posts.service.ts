import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Prisma } from '@prisma/client';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePostDto, authorId: string) {
    const categoryConnect = dto.categoryId
      ? { category: { connect: { id: dto.categoryId } } }
      : {};
    const tagsConnect = dto.tags?.length
      ? { tags: { connect: dto.tags.map((id) => ({ id })) } }
      : {};

    // 创建帖子
    return this.prisma.post.create({
      data: {
        // 创建数据
        title: dto.title,
        content: dto.content,
        status: dto.status ?? 'DRAFT',
        author: { connect: { id: authorId } },
        ...categoryConnect,
        ...tagsConnect,
      },
      select: {
        // 选择返回的字段
        id: true, // 帖子ID
        title: true, // 帖子标题
        status: true, // 帖子状态
        authorId: true, // 作者ID
        createdAt: true, // 创建时间
        author: { select: { id: true, username: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });
  } // 创建帖子

  async findAll(query: QueryPostDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = {};
    if (query.keyword?.trim()) {
      const k = query.keyword.trim();
      where.OR = [
        { title: { contains: k, mode: 'insensitive' } },
        { content: { contains: k, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // NOTE: 如果你刚改完 schema 但 Prisma Client/TS Server 还没刷新，
        // 这里的类型可能暂时不认识 category/tags。运行 `npx prisma generate` 后可去掉断言。
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: { select: { id: true, username: true } },
          category: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, email: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async update(id: number, dto: UpdatePostDto) {
    const exists = await this.prisma.post.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Post #${id} not found`);

    const { categoryId, tags, ...data } = dto as any;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(categoryId === undefined
          ? {}
          : { category: { connect: { id: categoryId } } }),
        ...(tags === undefined ? {} : { tags: { set: tags.map((t: string) => ({ id: t })) } }),
      },
      include: {
        author: { select: { id: true, username: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: number, authorId: string) {
    const exists = await this.prisma.post.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Post #${id} not found`);
    if (exists.authorId !== authorId)
      throw new ForbiddenException('无权限删除');

    return this.prisma.post.delete({ where: { id } });
  }
}
