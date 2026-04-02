<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const crumbs = computed(() =>
  route.matched
    .filter((r) => r.path !== '/' && r.meta?.title)
    .map((r) => ({
      path: r.path,
      title: String(r.meta.title),
    })),
);

function go(path: string) {
  router.push(path);
}
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item @click="go('/')" style="cursor: pointer"
      >首页</el-breadcrumb-item
    >
    <el-breadcrumb-item v-for="c in crumbs" :key="c.path">
      {{ c.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
