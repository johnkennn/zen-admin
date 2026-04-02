<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTagsStore } from '@/stores/tags';

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsStore();

const tags = computed(() => tagsStore.tags);
const active = computed(() => route.fullPath);

function go(fullPath: string) {
  router.push(fullPath);
}

function close(fullPath: string) {
  // 关闭激活标签时，跳到最后一个
  const isActive = fullPath === active.value;
  tagsStore.remove(fullPath);
  if (isActive) {
    const last = tagsStore.tags[tagsStore.tags.length - 1];
    router.push(last?.fullPath || '/');
  }
}

function refresh() {
  tagsStore.refresh();
}

async function fullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) await el.requestFullscreen();
  else await document.exitFullscreen();
}
</script>

<template>
  <div class="tags">
    <div class="tags__left">
      <el-tag
        v-for="t in tags"
        :key="t.fullPath"
        :effect="t.fullPath === active ? 'dark' : 'plain'"
        closable
        :disable-transitions="true"
        @close="close(t.fullPath)"
        @click="go(t.fullPath)"
      >
        {{ t.title }}
      </el-tag>
    </div>

    <div class="tags__right">
      <el-button text @click="refresh">刷新</el-button>
      <el-button text @click="fullscreen">全屏</el-button>

      <el-dropdown>
        <el-button text>更多</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="tagsStore.clearOthers(active)"
              >关闭其他</el-dropdown-item
            >
            <el-dropdown-item @click="tagsStore.clear()"
              >关闭全部</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}
.tags__left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tags__right {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
