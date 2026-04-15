<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { UserRole } from '@packages/shared';
import {
  createUser,
  deleteUser,
  fetchUsers,
  type UserListItem,
} from '@/api/users';
import { getApiErrorMessage } from '@/utils/https';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);

const loading = ref(false);
const list = ref<UserListItem[]>([]);

const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  email: '',
  username: '',
  password: '',
  role: 'USER' as UserRole,
});

const rules: FormRules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

function roleLabel(role: UserRole) {
  return role === 'ADMIN' ? '管理员' : '普通用户';
}

async function loadList() {
  if (!isAdmin.value) return;
  loading.value = true;
  try {
    list.value = await fetchUsers();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '加载失败'));
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.email = '';
  form.username = '';
  form.password = '';
  form.role = 'USER';
  dialogVisible.value = true;
}

async function submitForm() {
  await formRef.value?.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    await createUser({
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
    });
    ElMessage.success('已创建');
    dialogVisible.value = false;
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '创建失败'));
  } finally {
    saving.value = false;
  }
}

async function onDelete(row: UserListItem) {
  if (row.id === userStore.userId) {
    ElMessage.warning('不能删除当前登录账号');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定删除用户「${row.username}」吗？`,
      '删除确认',
      { type: 'warning' },
    );
  } catch {
    return;
  }
  try {
    await deleteUser(row.id);
    ElMessage.success('已删除');
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '删除失败'));
  }
}

onMounted(() => {
  loadList();
});
</script>

<template>
  <div class="user-page">
    <template v-if="isAdmin">
      <div class="toolbar">
        <el-button type="primary" @click="openCreate">新增用户</el-button>
        <el-button @click="loadList">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'info'" size="small">
              {{ roleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.id !== userStore.userId"
              link
              type="danger"
              @click="onDelete(row)"
            >
              删除
            </el-button>
            <span v-else class="muted">当前账号</span>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <el-alert v-else title="无权限" type="warning" show-icon :closable="false">
      仅管理员可访问用户管理。
    </el-alert>

    <el-dialog
      v-model="dialogVisible"
      title="新增用户"
      width="440px"
      destroy-on-close
      @closed="formRef?.resetFields()"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="普通用户" value="USER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-page {
  padding: 16px;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
