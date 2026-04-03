import { requestData } from '@/utils/https';

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface PostAuthorBrief {
  id: string;
  username: string;
}

export interface PostListItem {
  id: number;
  title: string;
  status: PostStatus;
  createdAt: string;
  author: PostAuthorBrief;
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
  createdAt: string;
  updatedAt: string;
  author: PostAuthorBrief & { email?: string };
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
}

export function fetchPosts(params: {
  page?: number;
  limit?: number;
  keyword?: string;
}) {
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
