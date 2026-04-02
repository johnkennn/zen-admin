<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './widgets/Sidebar.vue';
import Breadcrumb from './widgets/Breadcrumb.vue';
import UserAvatar from './widgets/UseAvatar.vue';
import TagsView from './widgets/TagsView.vue';
import { useTagsStore } from '@/stores/tags';

const tags = useTagsStore();
const collapsed = ref(false);

function toggleDark() {
  document.documentElement.classList.toggle('dark');
}
</script>

<template>
  <el-container class="layout">
    <el-aside class="layout__aside" :width="collapsed ? '64px' : '220px'">
      <div class="layout__logo">
        <span v-if="!collapsed">Zen Admin</span>
        <span v-else>Z</span>
      </div>
      <Sidebar :collapsed="collapsed" />
    </el-aside>

    <el-container>
      <el-header class="layout__header">
        <div class="layout__header-left">
          <el-button text @click="collapsed = !collapsed">
            {{ collapsed ? '展开' : '收起' }}
          </el-button>
          <Breadcrumb />
        </div>

        <div class="layout__header-right">
          <el-button text @click="toggleDark"> 切换暗黑 </el-button>
          <UserAvatar />
        </div>
      </el-header>

      <!-- 标签栏：不参与路由渲染 -->
      <TagsView class="layout__tags" />

      <el-main class="layout__main">
        <!-- 路由视图：每次路由变化时，重新渲染 -->
        <router-view :key="tags.refreshKey + $route.fullPath" />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}

.layout__aside {
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.layout__logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 700;
  border-bottom: 1px solid var(--el-border-color);
}

.layout__header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.layout__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.layout__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layout__main {
  background: var(--el-bg-color-page);
  overflow: auto;
}
</style>
