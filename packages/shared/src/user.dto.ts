// user.dto.ts 是用户DTO类型
// 使用 export type UserRole = 'ADMIN' | 'USER'; 定义用户角色
// 使用 export interface UserLoginResponse 定义用户登录响应
export type UserRole = 'ADMIN' | 'USER';

export interface UserLoginResponse {
  // 用户登录响应
  user: {
    id: string; // 用户ID
    email: string; // 用户邮箱
    username: string; // 用户名
    role: UserRole; // 用户角色
    createdAt?: string; // 创建时间
  };
  accessToken: string; // 访问令牌
}
