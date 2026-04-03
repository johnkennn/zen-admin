import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { normalizeStoredName } from '../common/utils/normalize-name';

function isPrismaUniqueError(e: unknown) {
  // 判断是否为 Prisma 唯一错误
  return (e as any)?.code === 'P2002';
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async create(dto: CreateCategoryDto) {
    const n = normalizeStoredName(dto.name);

    const exists = await this.prisma.category.findUnique({
      where: { name: n },
    });
    if (exists) throw new ConflictException('分类名已存在');

    try {
      return await this.prisma.category.create({
        data: { name: n },
        select: { id: true, name: true },
      });
    } catch (e) {
      if (isPrismaUniqueError(e)) throw new ConflictException('分类名已存在');
      throw e;
    }
  }

  /** 删除分类；因 schema 中 onDelete: SetNull，下属文章的 categoryId 会变为 null */
  async remove(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Category #${id} not found`);
    return this.prisma.category.delete({ where: { id } });
  }
}
