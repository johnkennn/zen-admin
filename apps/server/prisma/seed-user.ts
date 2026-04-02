import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function upsertUser( // 创建或更新用户
  email: string,
  username: string,
  plainPassword: string,
  role: Role,
) {
  const password = await argon2.hash(plainPassword);
  return prisma.user.upsert({
    where: { username }, // 更新条件
    update: { email, password, role }, // 更新数据
    create: { email, username, password, role }, // 创建数据
  });
}

async function main() {
  // 主函数
  await upsertUser('admin@example.com', 'admin', 'admin123', Role.ADMIN);
  await upsertUser('alice@example.com', 'alice', '123456', Role.USER);
  await upsertUser('bob@example.com', 'bob', '123456', Role.USER);
  await upsertUser('carol@example.com', 'carol', '123456', Role.USER);
  await upsertUser('dave@example.com', 'dave', '123456', Role.USER);
  await upsertUser('ops@example.com', 'ops', 'ops123', Role.ADMIN);

  console.log(
    'Seeded users: admin/admin123, ops/ops123, alice/123456, bob/123456, carol/123456, dave/123456',
  );
}

main().finally(() => prisma.$disconnect()); // 断开数据库连接
