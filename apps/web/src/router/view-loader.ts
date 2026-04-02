import type { Component } from 'vue'; // 导入 Component 类型

// key: '/src/views/**/**.vue'
const modules = import.meta.glob('/src/views/**/*.vue'); // 导入模块
// 加载视图
export function loadView(
  componentPath: string,
): () => Promise<{ default: Component }> {
  // 后端给：'views/system/user/index.vue'
  const fullPath = `/src/${componentPath}`;

  const loader = modules[fullPath]; // 导入模块
  if (!loader) {
    // 你练手时建议直接抛错，方便定位后端给错路径
    throw new Error(`View not found: ${fullPath}`);
  }
  return loader as any;
}
