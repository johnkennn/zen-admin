<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePermissionStore } from '@/stores/permission';
import SidebarItem from './SidebarItem.vue';

defineProps<{ collapsed: boolean }>();

const router = useRouter();
const route = useRoute();
const permission = usePermissionStore();

const menus = computed(() => permission.menu);

function onSelect(index: string) {
  router.push(index);
}
</script>

<template>
  <el-menu
    :default-active="route.path"
    :collapse="collapsed"
    class="sidebar-menu"
    @select="onSelect"
  >
    <SidebarItem v-for="m in menus" :key="m.id" :item="m" />
  </el-menu>
</template>

<style scoped>
.sidebar-menu {
  border-right: none;
}
</style>
