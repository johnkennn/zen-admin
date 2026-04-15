import { requestData } from '@/utils/https';

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface PostAuthorBrief {
  id: string;
  username: string;
}

export interface CategoryBrief {
  id: string;
  name: string;
}

export interface TagBrief {
  id: string;
  name: string;
}

export interface PostListItem {
  id: number;
  title: string;
  status: PostStatus;
  createdAt: string;
  /** 封面相对路径，如 /uploads/posts/xxx.webp */
  coverUrl?: string | null;
  author: PostAuthorBrief;
  category?: CategoryBrief | null;
  tags?: TagBrief[];
}

export interface PostListResult {
  items: PostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  status: PostStatus;
  authorId: string;
  coverUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  author: PostAuthorBrief & { email?: string };
  category?: CategoryBrief | null;
  tags?: TagBrief[];
}

export interface PostCreateResult {
  id: number;
  title: string;
  status: PostStatus;
  authorId: string;
  createdAt: string;
}

export interface SavePostPayload {
  title: string;
  content: string;
  status?: PostStatus;
  /** 分类 id，不传或 undefined 表示不关联 */
  categoryId?: string;
  /** 标签 id 列表 */
  tags?: string[];
  /** POST /posts/cover 返回的 url；编辑时传空字符串可清除封面 */
  coverUrl?: string;
}

/** 与后端 QueryPostDto / postsService.findAll 对齐 */
export interface FetchPostsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  status?: PostStatus;
  /** ISO 日期或 YYYY-MM-DD，后端按 >= 筛选 */
  createdAt?: string;
  updatedAt?: string;
}

/** 封面图上传（multipart，字段名 file），返回可写入 coverUrl 的路径 */
export function uploadPostCover(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return requestData<{ url: string }>({
    url: '/posts/cover',
    method: 'POST',
    data: fd,
  });
}

export function fetchPosts(params: FetchPostsParams) {
  return requestData<PostListResult>({
    url: '/posts',
    method: 'GET',
    params,
  });
}

export function fetchPost(id: number) {
  return requestData<PostDetail>({
    url: `/posts/${id}`,
    method: 'GET',
  });
}

export function createPost(data: SavePostPayload) {
  return requestData<PostCreateResult>({
    url: '/posts',
    method: 'POST',
    data,
  });
}

export function updatePost(id: number, data: Partial<SavePostPayload>) {
  return requestData<PostDetail>({
    url: `/posts/${id}`,
    method: 'PATCH',
    data,
  });
}

export function deletePost(id: number) {
  return requestData<PostDetail>({
    url: `/posts/${id}`,
    method: 'DELETE',
  });
}
