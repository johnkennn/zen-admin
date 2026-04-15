import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Prisma } from '@prisma/client';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Role } from '@prisma/client';
import {
  isAllowedPostCoverUrl,
  tryUnlinkPostCoverByUrl,
} from './post-file.util';

/** 与 schema `coverUrl` 对齐；findUnique 的 select 用断言兼容未 generate 的旧 Client */
type PostRowAuthorAndCover = {
  id: number;
  authorId: string;
  coverUrl: string | null;
};

type PostRowAuthorCoverOnly = { authorId: string; coverUrl: string | null };

const postListSelect = {
  id: true,
  title: true,
  status: true,
  coverUrl: true,
  createdAt: true,
  author: { select: { id: true, username: true } },
  category: { select: { id: true, name: true } },
  tags: { select: { id: true, name: true } },
} as unknown as Prisma.PostSelect;

const postCreateSelect = {
  id: true,
  title: true,
  status: true,
  authorId: true,
  coverUrl: true,
  createdAt: true,
  author: { select: { id: true, username: true } },
  category: { select: { id: true, name: true } },
  tags: { select: { id: true, name: true } },
} as unknown as Prisma.PostSelect;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertPostAuthorOrAdmin(
    authorId: string,
    userId: string,
    role: Role,
  ) {
    if (role === 'ADMIN' || authorId === userId) return;
    throw new ForbiddenException('无权操作该帖子');
  }

  async create(dto: CreatePostDto, authorId: string) {
    if (dto.coverUrl != null && dto.coverUrl !== '') {
      if (!isAllowedPostCoverUrl(dto.coverUrl)) {
        throw new BadRequestException('无效的封面地址');
      }
    }
    const categoryConnect = dto.categoryId
      ? { category: { connect: { id: dto.categoryId } } }
      : {};
    const tagsConnect = dto.tags?.length
      ? { tags: { connect: dto.tags.map((id) => ({ id })) } }
      : {};

    const cover =
      dto.coverUrl && dto.coverUrl.length > 0 ? dto.coverUrl : undefined;

    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? 'DRAFT',
        author: { connect: { id: authorId } },
        ...(cover !== undefined ? { coverUrl: cover } : {}),
        ...categoryConnect,
        ...tagsConnect,
      },
      select: postCreateSelect,
    });
  }

  async findAll(query: QueryPostDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const {
      keyword,
      categoryId,
      tagId,
      authorId,
      status,
      createdAt,
      updatedAt,
    } = query;
    const where: Prisma.PostWhereInput = {};
    const keywordTrim = keyword?.trim();
    if (keywordTrim) {
      where.OR = [
        //mode: 'insensitive'：不区分大小写
        { title: { contains: keywordTrim, mode: 'insensitive' } },
        { content: { contains: keywordTrim, mode: 'insensitive' } },
      ];
    }
    // 精确匹配：分类 / 作者 / 状态
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (status) where.status = status;

    // 多对多标签查询
    if (tagId) where.tags = { some: { id: tagId } };

    // 时间范围查询（自动转 Date 类型）
    if (createdAt) where.createdAt = { gte: new Date(createdAt) };
    if (updatedAt) where.updatedAt = { gte: new Date(updatedAt) };
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // NOTE: 如果你刚改完 schema 但 Prisma Client/TS Server 还没刷新，
        // 这里的类型可能暂时不认识 category/tags。运行 `npx prisma generate` 后可去掉断言。
        select: postListSelect,
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

  async update(id: number, dto: UpdatePostDto, userId: string, role: Role) {
    const exists = (await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        coverUrl: true,
      } as unknown as Prisma.PostSelect,
    })) as PostRowAuthorAndCover | null;
    if (!exists) throw new NotFoundException(`Post #${id} not found`);
    this.assertPostAuthorOrAdmin(exists.authorId, userId, role);
    const { categoryId, tags, coverUrl, ...rest } = dto as any;

    if (coverUrl !== undefined) {
      if (
        coverUrl !== '' &&
        coverUrl != null &&
        !isAllowedPostCoverUrl(coverUrl)
      ) {
        throw new BadRequestException('无效的封面地址');
      }
      const next =
        coverUrl === '' || coverUrl === null
          ? null
          : (coverUrl as string);
      const prev = exists.coverUrl;
      if (next !== prev && prev) {
        tryUnlinkPostCoverByUrl(prev);
      }
    }

    const data: Prisma.PostUpdateInput = { ...rest };

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(coverUrl !== undefined
          ? {
              coverUrl:
                coverUrl === '' || coverUrl === null
                  ? null
                  : (coverUrl as string),
            }
          : {}),
        ...(categoryId === undefined
          ? {}
          : !categoryId
            ? { category: { disconnect: true } }
            : { category: { connect: { id: categoryId } } }),
        ...(tags === undefined
          ? {}
          : { tags: { set: tags.map((t: string) => ({ id: t })) } }),
      },
      include: {
        author: { select: { id: true, username: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: number, userId: string, role: Role) {
    const exists = (await this.prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true,
        coverUrl: true,
      } as unknown as Prisma.PostSelect,
    })) as PostRowAuthorCoverOnly | null;
    if (!exists) throw new NotFoundException(`Post #${id} not found`);
    this.assertPostAuthorOrAdmin(exists.authorId, userId, role);
    tryUnlinkPostCoverByUrl(exists.coverUrl);
    return this.prisma.post.delete({ where: { id } });
  }
}
