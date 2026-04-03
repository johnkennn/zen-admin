import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { normalizeStoredName } from '../common/utils/normalize-name';

function isPrismaUniqueError(e: unknown) {
  return (e as any)?.code === 'P2002';
}

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async create(dto: CreateTagDto) {
    const n = normalizeStoredName(dto.name);

    const exists = await this.prisma.tag.findUnique({ where: { name: n } });
    if (exists) throw new ConflictException('标签名已存在');

    try {
      return await this.prisma.tag.create({
        data: { name: n },
        select: { id: true, name: true },
      });
    } catch (e) {
      if (isPrismaUniqueError(e)) throw new ConflictException('标签名已存在');
      throw e;
    }
  }
}
