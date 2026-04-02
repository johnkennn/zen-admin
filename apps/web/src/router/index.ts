import { createRouter, createWebHistory } from 'vue-router';
const Layout = () => import('@/layout/index.vue');
const Login = () => import('@/views/login/index.vue');
const NotFound = () => import('@/views/404.vue');

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login, meta: { noTag: true } },

    {
      path: '/',
      name: 'Root',
      component: Layout,
      children: [
        // 动态路由都 add 到这里（parent name = 'Root'）
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { noTag: true },
    },
  ],
});
