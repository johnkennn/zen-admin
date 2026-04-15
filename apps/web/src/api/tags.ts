import { requestData } from '@/utils/https';

export interface TagItem {
  id: string;
  name: string;
}

export function fetchTags() {
  return requestData<TagItem[]>({
    url: '/tags',
    method: 'GET',
  });
}

export function createTag(data: { name: string }) {
  return requestData<TagItem>({
    url: '/tags',
    method: 'POST',
    data,
  });
}

export function updateTag(id: string, data: { name: string }) {
  return requestData<TagItem>({
    url: `/tags/${id}`,
    method: 'PATCH',
    data,
  });
}

export function deleteTag(id: string) {
  return requestData<TagItem>({
    url: `/tags/${id}`,
    method: 'DELETE',
  });
}
