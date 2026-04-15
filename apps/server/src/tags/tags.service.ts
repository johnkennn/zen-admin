import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
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

  async update(id: string, dto: UpdateTagDto) {
    const exists = await this.prisma.tag.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Tag #${id} not found`);
    if (dto.name === undefined)
      throw new BadRequestException('请提供要修改的名称');

    const n = normalizeStoredName(dto.name);
    if (n === exists.name) {
      return { id: exists.id, name: exists.name };
    }

    const dup = await this.prisma.tag.findUnique({ where: { name: n } });
    if (dup && dup.id !== id) throw new ConflictException('标签名已存在');

    try {
      return await this.prisma.tag.update({
        where: { id },
        data: { name: n },
        select: { id: true, name: true },
      });
    } catch (e) {
      if (isPrismaUniqueError(e)) throw new ConflictException('标签名已存在');
      throw e;
    }
  }

  async remove(id: string) {
    const exists = await this.prisma.tag.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Tag #${id} not found`);
    return this.prisma.tag.delete({ where: { id } });
  }
}
