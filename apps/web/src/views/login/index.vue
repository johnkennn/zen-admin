<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/api/auth';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const loading = ref(false);
const form = reactive({ username: 'admin', password: 'admin123' });

async function onSubmit() {
  loading.value = true;
  try {
    const res = await login(form.username, form.password);
    localStorage.setItem('accessToken', res.accessToken);
    userStore.setRole(res.user.role);
    ElMessage.success('登录成功');
    await router.replace('/');
  } catch (e: any) {
    ElMessage.error(e?.message ?? '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div style="max-width: 360px; margin: 80px auto; padding: 24px">
    <h2 style="margin: 0 0 12px">登录</h2>
    <el-form :model="form" label-width="80px" @submit.prevent>
      <el-form-item label="用户名">
        <el-input v-model="form.username" autocomplete="username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          autocomplete="current-password"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
