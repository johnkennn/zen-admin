<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  type CategoryItem,
} from '@/api/categories';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);

const loading = ref(false);
const list = ref<CategoryItem[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<string | null>(null);
const saving = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({ name: '' });

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
};

async function loadList() {
  loading.value = true;
  try {
    list.value = await fetchCategories();
  } catch (e: unknown) {
    ElMessage.error(String((e as { message?: string })?.message ?? '加载失败'));
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  dialogMode.value = 'create';
  editingId.value = null;
  form.name = '';
  dialogVisible.value = true;
}

function openEdit(row: CategoryItem) {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.name = row.name;
  dialogVisible.value = true;
}

async function submitForm() {
  await formRef.value?.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    if (dialogMode.value === 'create') {
      await createCategory({ name: form.name });
      ElMessage.success('已创建');
    } else if (editingId.value) {
      await updateCategory(editingId.value, { name: form.name });
      ElMessage.success('已保存');
    }
    dialogVisible.value = false;
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(String((e as { message?: string })?.message ?? '保存失败'));
  } finally {
    saving.value = false;
  }
}

async function onDelete(row: CategoryItem) {
  try {
    await ElMessageBox.confirm(
      `确定删除分类「${row.name}」吗？下属文章的分类将清空。`,
      '删除确认',
      { type: 'warning' },
    );
  } catch {
    return;
  }
  try {
    await deleteCategory(row.id);
    ElMessage.success('已删除');
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(String((e as { message?: string })?.message ?? '删除失败'));
  }
}

onMounted(() => {
  loadList();
});
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" v-if="isAdmin" @click="openCreate"
        >新建分类</el-button
      >
      <el-button @click="loadList">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column
        prop="id"
        label="ID"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column
        v-if="isAdmin"
        label="操作"
        width="160"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建分类' : '编辑分类'"
      width="420px"
      destroy-on-close
      @closed="formRef?.resetFields()"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="form.name"
            maxlength="50"
            show-word-limit
            placeholder="保存时会转小写并去掉空格"
          />
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
.page {
  padding: 16px;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
</style>
