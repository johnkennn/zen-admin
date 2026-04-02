import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from '@/router';
import { setupGuards } from '@/router/guard';
import './style.css';
import App from './App.vue';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { permission } from '@/directives/permission';

const app = createApp(App); // 创建应用

// 先安装 Pinia，再设置依赖 store 的守卫
const pinia = createPinia();
app.use(pinia);

setupGuards(router); // 设置路由守卫
app.use(router); // 使用路由
app.mount('#app'); // 挂载应用
app.directive('permission', permission); // 安装权限指令
