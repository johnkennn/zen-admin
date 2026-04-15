import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class AdminCreateUserDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsString()
  @MinLength(2, { message: '用户名至少 2 个字符' })
  @MaxLength(32, { message: '用户名最长 32 个字符' })
  username!: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 个字符' })
  password!: string;

  @IsOptional()
  @IsEnum(Role, { message: '角色必须是 ADMIN 或 USER' })
  role?: Role;
}
