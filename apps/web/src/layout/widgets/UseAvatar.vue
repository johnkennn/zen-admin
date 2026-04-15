<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';
import { useTagsStore } from '@/stores/tags';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const permission = usePermissionStore();
const tagsStore = useTagsStore();
const userStore = useUserStore();

const displayName = computed(() => userStore.username || 'User');
const avatarText = computed(() =>
  displayName.value.slice(0, 1).toUpperCase(),
);

async function logout() {
  localStorage.removeItem('accessToken');
  userStore.reset();
  permission.reset();
  tagsStore.clear();
  await router.replace('/login');
}
</script>

<template>
  <el-dropdown>
    <span class="avatar">
      <el-avatar :size="32">{{ avatarText }}</el-avatar>
      <span class="avatar__name">{{ displayName }}</span>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.avatar__name {
  font-size: 14px;
}
</style>
