import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertRoleMenu(role: Role, menuId: string) {
  return prisma.roleMenu.upsert({
    where: { role_menuId: { role, menuId } } as any,
    update: {},
    create: { role, menuId },
  });
}

async function main() {
  // 1) 创建菜单（树）
  const dashboard = await prisma.menu.upsert({
    where: { path: '/dashboard' },
    update: {
      affix: true,
      component: 'views/dashboard/index.vue',
      icon: 'House',
      sort: 1,
    },
    create: {
      name: '仪表盘',
      path: '/dashboard',
      icon: 'House',
      component: 'views/dashboard/index.vue',
      sort: 1,
      affix: true,
    },
  });

  const system = await prisma.menu.upsert({
    where: { path: '/system' },
    update: {},
    create: { name: '系统管理', path: '/system', icon: 'Setting', sort: 10 },
  });

  const profile = await prisma.menu.upsert({
    where: { path: '/profile' },
    update: {},
    create: {
      name: '个人中心',
      path: '/profile',
      icon: 'Avatar',
      component: 'views/profile/index.vue',
      sort: 2,
    },
  });

  const reports = await prisma.menu.upsert({
    where: { path: '/reports' },
    update: {},
    create: { name: '报表', path: '/reports', icon: 'PieChart', sort: 20 },
  });

  const reportsSales = await prisma.menu.upsert({
    where: { path: '/reports/sales' },
    update: { parentId: reports.id },
    create: {
      name: '销售报表',
      path: '/reports/sales',
      icon: 'TrendCharts',
      component: 'views/reports/sales/index.vue',
      parentId: reports.id,
      sort: 21,
    },
  });

  const user = await prisma.menu.upsert({
    where: { path: '/system/user' },
    update: { parentId: system.id },
    create: {
      name: '用户管理',
      path: '/system/user',
      icon: 'User',
      component: 'views/system/user/index.vue',
      parentId: system.id,
      sort: 11,
    },
  });

  const posts = await prisma.menu.upsert({
    where: { path: '/posts' },
    update: {},
    create: {
      name: '帖子管理',
      path: '/posts',
      icon: 'Document',
      component: 'views/posts/index.vue',
      sort: 12,
    },
  });

  const content = await prisma.menu.upsert({
    where: { path: '/content' },
    update: {},
    create: {
      name: '内容',
      path: '/content',
      icon: 'FolderOpened',
      sort: 13,
    },
  });

  const contentCategories = await prisma.menu.upsert({
    where: { path: '/content/categories' },
    update: { parentId: content.id },
    create: {
      name: '分类管理',
      path: '/content/categories',
      icon: 'Collection',
      component: 'views/content/categories/index.vue',
      parentId: content.id,
      sort: 14,
    },
  });

  const contentTags = await prisma.menu.upsert({
    where: { path: '/content/tags' },
    update: { parentId: content.id },
    create: {
      name: '标签管理',
      path: '/content/tags',
      icon: 'PriceTag',
      component: 'views/content/tags/index.vue',
      parentId: content.id,
      sort: 15,
    },
  });

  // 2) 角色授权（RoleMenu）
  // USER: dashboard + profile
  for (const m of [
    dashboard,
    profile,
    posts,
    content,
    contentCategories,
    contentTags,
    reports,
    reportsSales,
  ]) {
    await upsertRoleMenu(Role.USER, m.id);
  }

  // ADMIN: dashboard + profile + reports(+sales) + system(+user) + posts + content(+categories+tags)
  for (const m of [dashboard, profile, system, user]) {
    await upsertRoleMenu(Role.ADMIN, m.id);
  }

  console.log('Seeded menus + role permissions');
}

main().finally(() => prisma.$disconnect());
