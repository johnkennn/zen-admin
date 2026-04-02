import { IsNotEmpty, IsString } from 'class-validator'; // 导入验证器

export class LoginDto {
  @IsNotEmpty() // 验证必填
  @IsString() // 验证字符串
  username!: string;

  // @IsNotEmpty()
  // @IsString()
  // @IsEmail() // 验证邮箱格式,登陆不需要邮箱
  // email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
