import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
