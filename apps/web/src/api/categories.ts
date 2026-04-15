import { requestData } from '@/utils/https';

export interface CategoryItem {
  id: string;
  name: string;
}

export function fetchCategories() {
  return requestData<CategoryItem[]>({
    url: '/categories',
    method: 'GET',
  });
}

export function createCategory(data: { name: string }) {
  return requestData<CategoryItem>({
    url: '/categories',
    method: 'POST',
    data,
  });
}

export function updateCategory(id: string, data: { name: string }) {
  return requestData<CategoryItem>({
    url: `/categories/${id}`,
    method: 'PATCH',
    data,
  });
}

export function deleteCategory(id: string) {
  return requestData<CategoryItem>({
    url: `/categories/${id}`,
    method: 'DELETE',
  });
}
