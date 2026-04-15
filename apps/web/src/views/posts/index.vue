<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules, UploadProps, UploadRawFile } from 'element-plus';
import { fetchCategories, type CategoryItem } from '@/api/categories';
import {
  createPost,
  deletePost,
  fetchPost,
  fetchPosts,
  updatePost,
  uploadPostCover,
  type PostDetail,
  type PostListItem,
  type PostStatus,
} from '@/api/posts';
import { getApiErrorMessage } from '@/utils/https';
import { fetchTags, type TagItem } from '@/api/tags';
import { fetchUsers, type UserListItem } from '@/api/users';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);

function canEditPost(row: PostListItem) {
  return isAdmin.value || row.author?.id === userStore.userId;
}

const loading = ref(false);
const tableData = ref<PostListItem[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);

/** 列表筛选（与后端 findAll 一致） */
const queryFilters = reactive({
  keyword: '',
  categoryId: undefined as string | undefined,
  tagId: undefined as string | undefined,
  authorId: undefined as string | undefined,
  status: undefined as PostStatus | undefined,
  createdAt: undefined as string | undefined,
  updatedAt: undefined as string | undefined,
});

const categories = ref<CategoryItem[]>([]);
const tagOptions = ref<TagItem[]>([]);
const authorOptions = ref<UserListItem[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const saving = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  title: '',
  content: '',
  status: 'DRAFT' as PostStatus,
  categoryId: undefined as string | undefined,
  tagIds: [] as string[],
  /** 封面路径，由上传接口返回 */
  coverUrl: '',
});

const coverUploading = ref(false);

function beforeCoverUpload(file: UploadRawFile) {
  const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
    file.type,
  );
  if (!ok) {
    ElMessage.error('仅支持 jpg / png / webp / gif');
    return false;
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不超过 2MB');
    return false;
  }
  return true;
}

const handleCoverUpload: UploadProps['httpRequest'] = async (options) => {
  const file = options.file as UploadRawFile;
  coverUploading.value = true;
  try {
    const { url } = await uploadPostCover(file);
    form.coverUrl = url;
    ElMessage.success('封面上传成功');
    options.onSuccess?.({ url });
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '上传失败'));
  } finally {
    coverUploading.value = false;
  }
};

function clearCover() {
  form.coverUrl = '';
}

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

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailPost = ref<PostDetail | null>(null);

async function openDetail(row: PostListItem) {
  detailLoading.value = true;
  detailPost.value = null;
  detailVisible.value = true;
  try {
    detailPost.value = await fetchPost(row.id);
  } catch (e: unknown) {
    detailVisible.value = false;
    ElMessage.error(getApiErrorMessage(e, '加载详情失败'));
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detailVisible.value = false;
}

function onDetailClosed() {
  detailPost.value = null;
}

async function loadMeta() {
  try {
    const [c, t] = await Promise.all([fetchCategories(), fetchTags()]);
    categories.value = c;
    tagOptions.value = t;
  } catch {
    ElMessage.error('加载分类或标签失败');
  }
  if (isAdmin.value) {
    try {
      authorOptions.value = await fetchUsers();
    } catch {
      ElMessage.warning('作者列表加载失败，作者筛选不可用');
    }
  }
}

function buildListParams() {
  return {
    page: page.value,
    limit: limit.value,
    keyword: queryFilters.keyword.trim() || undefined,
    categoryId: queryFilters.categoryId,
    tagId: queryFilters.tagId,
    authorId: queryFilters.authorId,
    status: queryFilters.status,
    createdAt: queryFilters.createdAt ? String(queryFilters.createdAt) : undefined,
    updatedAt: queryFilters.updatedAt ? String(queryFilters.updatedAt) : undefined,
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchPosts(buildListParams());
    tableData.value = res.items;
    total.value = res.total;
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '加载失败'));
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
  loadList();
}

function resetFilters() {
  queryFilters.keyword = '';
  queryFilters.categoryId = undefined;
  queryFilters.tagId = undefined;
  queryFilters.authorId = undefined;
  queryFilters.status = undefined;
  queryFilters.createdAt = undefined;
  queryFilters.updatedAt = undefined;
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
  form.categoryId = undefined;
  form.tagIds = [];
  form.coverUrl = '';
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
    form.categoryId = detail.category?.id;
    form.tagIds = detail.tags?.map((x) => x.id) ?? [];
    form.coverUrl = detail.coverUrl ?? '';
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
        ...(form.categoryId ? { categoryId: form.categoryId } : {}),
        ...(form.tagIds.length ? { tags: form.tagIds } : {}),
        ...(form.coverUrl ? { coverUrl: form.coverUrl } : {}),
      });
      ElMessage.success('创建成功');
    } else if (editingId.value != null) {
      await updatePost(editingId.value, {
        title: form.title,
        content: form.content,
        status: form.status,
        categoryId: form.categoryId ?? '',
        tags: form.tagIds,
        coverUrl: form.coverUrl,
      });
      ElMessage.success('已保存');
    }
    dialogVisible.value = false;
    await loadList();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '保存失败'));
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

onMounted(async () => {
  await loadMeta();
  loadList();
});
</script>

<template>
  <div class="posts-page">
    <div class="toolbar toolbar--filters">
      <el-input
        v-model="queryFilters.keyword"
        clearable
        placeholder="标题/正文关键词"
        class="filter-item filter-item--grow"
        @keyup.enter="onSearch"
      />
      <el-select
        v-model="queryFilters.categoryId"
        clearable
        filterable
        placeholder="分类"
        class="filter-item"
      >
        <el-option
          v-for="c in categories"
          :key="c.id"
          :label="c.name"
          :value="c.id"
        />
      </el-select>
      <el-select
        v-model="queryFilters.tagId"
        clearable
        filterable
        placeholder="包含标签"
        class="filter-item"
      >
        <el-option
          v-for="t in tagOptions"
          :key="t.id"
          :label="t.name"
          :value="t.id"
        />
      </el-select>
      <el-select
        v-model="queryFilters.status"
        clearable
        placeholder="状态"
        class="filter-item"
        style="width: 120px"
      >
        <el-option label="草稿" value="DRAFT" />
        <el-option label="已发布" value="PUBLISHED" />
      </el-select>
      <el-select
        v-if="isAdmin"
        v-model="queryFilters.authorId"
        clearable
        filterable
        placeholder="作者"
        class="filter-item filter-item--wide"
      >
        <el-option
          v-for="u in authorOptions"
          :key="u.id"
          :label="u.username"
          :value="u.id"
        />
      </el-select>
      <el-date-picker
        v-model="queryFilters.createdAt"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="创建 ≥ 该日"
        clearable
        class="filter-item"
      />
      <el-date-picker
        v-model="queryFilters.updatedAt"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="更新 ≥ 该日"
        clearable
        class="filter-item"
      />
      <el-button type="primary" @click="onSearch">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
      <el-button type="success" @click="openCreate">新建</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column label="封面" width="88" align="center">
        <template #default="{ row }">
          <img
            v-if="row.coverUrl"
            :src="row.coverUrl"
            class="cover-thumb"
            alt=""
          />
          <span v-else class="cover-thumb--empty">—</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column label="分类" width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.category?.name ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="160">
        <template #default="{ row }">
          <template v-if="row.tags?.length">
            <el-tag
              v-for="t in row.tags"
              :key="t.id"
              size="small"
              class="tag-chip"
            >
              {{ t.name }}
            </el-tag>
          </template>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'PUBLISHED' ? 'success' : 'info'"
            size="small"
          >
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
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button
            v-if="canEditPost(row)"
            link
            type="primary"
            @click="openEdit(row)"
            >编辑</el-button
          >
          <el-button
            v-if="canEditPost(row)"
            link
            type="danger"
            @click="onDelete(row)"
            >删除</el-button
          >
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
      width="560px"
      destroy-on-close
      @closed="onDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="封面" prop="coverUrl">
          <div class="cover-field">
            <el-upload
              :show-file-list="false"
              accept="image/jpeg,image/png,image/webp,image/gif"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
            >
              <el-button type="primary" plain :loading="coverUploading">
                上传封面
              </el-button>
            </el-upload>
            <template v-if="form.coverUrl">
              <img :src="form.coverUrl" class="cover-preview" alt="" />
              <el-button link type="danger" @click="clearCover">移除</el-button>
            </template>
            <span v-else class="cover-field__hint">可选，建议小于 2MB</span>
          </div>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            clearable
            filterable
            placeholder="不选则无分类"
            style="width: 100%"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tagIds">
          <el-select
            v-model="form.tagIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="可选多个标签"
            style="width: 100%"
          >
            <el-option
              v-for="t in tagOptions"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
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

    <el-dialog
      v-model="detailVisible"
      title="帖子详情"
      width="600px"
      destroy-on-close
      @closed="onDetailClosed"
    >
      <div v-loading="detailLoading" class="post-detail">
        <template v-if="detailPost">
          <div v-if="detailPost.coverUrl" class="post-detail__cover-wrap">
            <img
              :src="detailPost.coverUrl"
              class="post-detail__cover"
              alt="封面"
            />
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="标题">{{
              detailPost.title
            }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{
              statusLabel(detailPost.status)
            }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{
              detailPost.author?.username ?? '—'
            }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{
              detailPost.category?.name ?? '—'
            }}</el-descriptions-item>
            <el-descriptions-item label="标签">
              <template v-if="detailPost.tags?.length">
                <el-tag
                  v-for="t in detailPost.tags"
                  :key="t.id"
                  size="small"
                  class="tag-chip"
                >
                  {{ t.name }}
                </el-tag>
              </template>
              <span v-else>—</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              detailPost.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{
              detailPost.updatedAt
            }}</el-descriptions-item>
          </el-descriptions>
          <div class="post-detail__content-label">正文</div>
          <el-input
            :model-value="detailPost.content"
            type="textarea"
            :rows="10"
            readonly
            class="post-detail__textarea"
          />
        </template>
      </div>
      <template #footer>
        <el-button type="primary" @click="closeDetail">关闭</el-button>
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
.toolbar--filters .filter-item {
  width: 150px;
}
.toolbar--filters .filter-item--grow {
  flex: 1;
  min-width: 180px;
  max-width: 320px;
}
.toolbar--filters .filter-item--wide {
  width: 160px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.tag-chip {
  margin-right: 6px;
  margin-bottom: 4px;
}
.post-detail__content-label {
  margin: 12px 0 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.post-detail__textarea :deep(textarea) {
  cursor: default;
}
.cover-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  vertical-align: middle;
}
.cover-thumb--empty {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
.cover-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.cover-preview {
  max-height: 120px;
  max-width: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}
.cover-field__hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.post-detail__cover-wrap {
  margin-bottom: 12px;
}
.post-detail__cover {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>
