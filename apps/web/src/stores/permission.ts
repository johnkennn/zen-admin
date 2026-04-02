import { defineStore } from 'pinia'; // 导入 defineStore
import { RouterView, type RouteRecordRaw } from 'vue-router'; // 导入 RouteRecordRaw
import type { MenuItem } from '@packages/shared';
import { loadView } from '@/router/view-loader'; // 导入 loadView

function menuToRoutes(menu: MenuItem[]): RouteRecordRaw[] {
  // 将菜单转换为路由
  const walk = (items: MenuItem[]): RouteRecordRaw[] =>
    items.map((m) => {
      const route: RouteRecordRaw = {
        // 创建路由
        path: m.path,
        name: m.id, // 约定 id 全局唯一，适合做 name
        meta: { title: m.name, icon: m.icon, affix: Boolean(m.affix) },
        // 默认给一个占位组件，满足 RouteRecordRaw 类型要求
        component: RouterView,
      };

      if (m.children?.length) {
        // 如果有子菜单
        (route as any).children = walk(m.children); // 递归转换子菜单
        // 父级菜单没有 component 时，保持 RouterView 占位
      }

      if (m.component) {
        // 如果有组件
        route.component = loadView(m.component); // 加载组件
      }

      return route;
    });

  return walk(menu); // 返回路由
}

export const usePermissionStore = defineStore('permission', {
  // 创建权限 store
  state: () => ({
    menu: [] as MenuItem[], // 菜单
    dynamicRoutes: [] as RouteRecordRaw[], // 动态路由
    routesAdded: false, // 路由是否已添加
  }),
  actions: {
    setMenu(menu: MenuItem[]) {
      // 设置菜单
      this.menu = menu;
      this.dynamicRoutes = menuToRoutes(menu); // 转换为路由
    },
    markRoutesAdded() {
      // 标记路由已添加
      this.routesAdded = true;
    },
    reset() {
      // 重置
      this.menu = [];
      this.dynamicRoutes = [];
      this.routesAdded = false;
    },
  },
});
