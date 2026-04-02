<script setup lang="ts">
import { useRouter } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';
import { useTagsStore } from '@/stores/tags';
const router = useRouter();
const permission = usePermissionStore();
const tagsStore = useTagsStore();
async function logout() {
  localStorage.removeItem('accessToken');
  permission.reset();
  tagsStore.clear();
  await router.replace('/login');
}
</script>

<template>
  <el-dropdown>
    <span class="avatar">
      <el-avatar :size="32">U</el-avatar>
      <span class="avatar__name">User</span>
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
