import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator'; // 导入验证器
import { PostStatus } from '@prisma/client'; // 导入 PostStatus 枚举

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  @MaxLength(200, { message: '标题最长 200 字' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: '内容至少 10 个字符' })
  content!: string;

  @IsOptional()
  @IsEnum(PostStatus, { message: '状态必须是 DRAFT 或 PUBLISHED' })
  status?: PostStatus;
}
