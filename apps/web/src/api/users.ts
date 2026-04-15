import type { UserRole } from '@packages/shared';
import { requestData } from '@/utils/https';

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export function fetchUsers() {
  return requestData<UserListItem[]>({
    url: '/users',
    method: 'GET',
  });
}

export function createUser(data: CreateUserPayload) {
  return requestData<UserListItem>({
    url: '/users',
    method: 'POST',
    data,
  });
}

export function deleteUser(id: string) {
  return requestData<{ id: string }>({
    url: `/users/${id}`,
    method: 'DELETE',
  });
}
