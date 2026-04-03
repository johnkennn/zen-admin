import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

/** 部分更新：标题、正文、状态均可选 */
export class UpdatePostDto extends PartialType(CreatePostDto) {}
