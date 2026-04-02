export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  /** 前端路由组件路径，例如 'views/system/user/index.vue' */
  component?: string;
  /** 是否固定在标签栏（不可关闭） */
  affix?: boolean;
  children?: MenuItem[];
}
