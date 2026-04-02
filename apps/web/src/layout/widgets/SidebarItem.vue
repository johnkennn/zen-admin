<script setup lang="ts">
import type { MenuItem } from '@packages/shared';

defineProps<{
  item: MenuItem;
}>();
</script>

<template>
  <el-sub-menu v-if="item.children?.length" :index="item.path">
    <template #title>
      <span>{{ item.name }}</span>
    </template>

    <SidebarItem v-for="c in item.children" :key="c.id" :item="c" />
  </el-sub-menu>

  <el-menu-item v-else :index="item.path">
    <span>{{ item.name }}</span>
  </el-menu-item>
</template>

