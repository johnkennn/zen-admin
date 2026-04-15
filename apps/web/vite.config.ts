import { defineConfig } from 'vite'; // 导入 defineConfig 函数
import vue from '@vitejs/plugin-vue'; // 导入 vue 插件
import { fileURLToPath, URL } from 'node:url';

import AutoImport from 'unplugin-auto-import/vite'; // 导入 AutoImport 插件
import Components from 'unplugin-vue-components/vite'; // 导入 Components 插件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'; // 导入 ElementPlus 解析器

// https://vite.dev/config/
export default defineConfig({
  // 配置并导出 Vite
  plugins: [
    // 配置插件
    vue(), // 导入 Vue 插件
    AutoImport({
      // 配置 AutoImport
      resolvers: [ElementPlusResolver()], // 配置 ElementPlus 解析器
      dts: 'src/auto-imports.d.ts', // 配置 AutoImport 的 dts 文件
    }),
    Components({
      // 配置 Components
      resolvers: [ElementPlusResolver()], // 配置 ElementPlus 解析器
      dts: 'src/components.d.ts', // 配置 Components 的 dts 文件
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 配置代理
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 把 /api/auth/login -> /auth/login（如果你的后端路由不带 /api 前缀）
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      /** 与 Nest main.ts 中 uploads 静态目录一致；开发时 <img src="/uploads/..."> 走代理 */
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
