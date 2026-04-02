import type { Router } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';
import { useTagsStore } from '@/stores/tags';
import { getMenu } from '@/api/auth';

function getToken() {
  return localStorage.getItem('accessToken');
}

function getErrStatus(err: unknown): number | undefined {
  return (err as any)?.response?.status;
}

export function setupGuards(router: Router) {
  router.beforeEach(async (to) => {
    const token = getToken();
    const permission = usePermissionStore();

    if (to.path === '/login') return true;

    if (!token) {
      return { path: '/login', replace: true };
    }

    // 已经加过动态路由，直接放行
    if (permission.routesAdded) return true;

    // 还没菜单：拉菜单 -> addRoute -> 重新进入目标页
    let menu;
    try {
      menu = await getMenu();
    } catch (err) {
      const status = getErrStatus(err);
      if (status === 401) {
        return { path: '/login', replace: true };
      }
      return { path: '/login', replace: true };
    }
    permission.setMenu(menu);

    for (const r of permission.dynamicRoutes) {
      // 添加动态路由,
      router.addRoute('Root', r); // 注意 parent name = Root
    }
    permission.markRoutesAdded();

    return { ...to, replace: true };
  });
  router.afterEach((to) => {
    // 1) 过滤不需要出现在 TagsView 的路由
    if (to.meta?.noTag) return;
    // 2) 添加到 TagsView
    const title = (to.meta?.title as string) || String(to.name || to.path);
    const tags = useTagsStore();
    tags.add({
      title,
      fullPath: to.fullPath,
      path: to.path,
      name: to.name ?? undefined,
      affix: Boolean(to.meta?.affix),
    });
  });
}
