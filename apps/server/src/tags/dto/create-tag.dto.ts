import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty({ message: '标签名不能为空' })
  @MaxLength(50, { message: '标签名最长 50 字' })
  name!: string;
}
