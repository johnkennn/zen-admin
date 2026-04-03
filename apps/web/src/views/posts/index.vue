<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  createPost,
  deletePost,
  fetchPost,
  fetchPosts,
  updatePost,
  type PostListItem,
  type PostStatus,
} from '@/api/posts';

const loading = ref(false);
const tableData = ref<PostListItem[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const keyword = ref('');

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const saving = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  title: '',
  content: '',
  status: 'DRAFT' as PostStatus,
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入正文', trigger: 'blur' },
    { min: 10, message: '正文至少 10 个字符', trigger: 'blur' },
  ],
};

const dialogTitle = computed(() =>
  dialogMode.value === 'create' ? '新建帖子' : '编辑帖子',
);

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchPosts({
      page: page.value,
      limit: limit.value,
      keyword: keyword.value.trim() || undefined,
    });
    tableData.value = res.items;
    total.value = res.total;
  } catch (e: unknown) {
    const msg =
      (e as { message?: string })?.message ??
      (Array.isArray((e as { message?: unknown })?.message)
        ? JSON.stringify((e as { message: unknown }).message)
        : '加载失败');
    ElMessage.error(String(msg));
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
  loadList();
}

function onPageChange(p: number) {
  page.value = p;
  loadList();
}

function onPageSizeChange(s: number) {
  limit.value = s;
  page.value = 1;
  loadList();
}

function openCreate() {
  dialogMode.value = 'create';
  editingId.value = null;
  form.title = '';
  form.content = '';
  form.status = 'DRAFT';
  dialogVisible.value = true;
}

async function openEdit(row: PostListItem) {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  saving.value = true;
  try {
    const detail = await fetchPost(row.id);
    form.title = detail.title;
    form.content = detail.content;
    form.status = detail.status;
    dialogVisible.value = true;
  } catch (e: unknown) {
    ElMessage.error(
      String((e as { message?: string })?.message ?? '加载详情失败'),
    );
  } finally {
    saving.value = false;
  }
}

async function submitForm() {
  await formRef.value?.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    if (dialogMode.value === 'create') {
      await createPost({
        title: form.title,
        content: form.content,
        status: form.status,
      });
      ElMessage.success('创建成功');
    } else if (editingId.value != null) {
      await updatePost(editingId.value, {
        title: form.title,
        content: form.content,
        status: form.status,
      });
      ElMessage.success('已保存');
    }
    dialogVisible.value = false;
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(
      String((e as { message?: string })?.message ?? '保存失败'),
    );
  } finally {
    saving.value = false;
  }
}

function onDialogClosed() {
  formRef.value?.resetFields();
}

async function onDelete(row: PostListItem) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.title}」吗？`,
      '删除确认',
      { type: 'warning' },
    );
  } catch {
    return;
  }
  try {
    await deletePost(row.id);
    ElMessage.success('已删除');
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(
      String((e as { message?: string })?.message ?? '删除失败'),
    );
  }
}

function statusLabel(s: PostStatus) {
  return s === 'PUBLISHED' ? '已发布' : '草稿';
}

onMounted(() => {
  loadList();
});
</script>

<template>
  <div class="posts-page">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        clearable
        placeholder="搜索标题或正文"
        style="width: 220px"
        @keyup.enter="onSearch"
      />
      <el-button type="primary" @click="onSearch">查询</el-button>
      <el-button type="success" @click="openCreate">新建</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="120">
        <template #default="{ row }">
          {{ row.author?.username ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :total="total"
        :page-size="limit"
        :current-page="page"
        :page-sizes="[10, 20, 50]"
        @current-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      destroy-on-close
      @closed="onDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" />
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
.posts-page {
  padding: 16px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
