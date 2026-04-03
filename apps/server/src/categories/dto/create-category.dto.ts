import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: '分类名不能为空' })
  @MaxLength(50, { message: '分类名最长 50 字' })
  name!: string;
}
