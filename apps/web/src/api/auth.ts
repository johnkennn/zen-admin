import type { UserLoginResponse, MenuItem } from '@packages/shared';
import { requestData } from '../utils/https';

export function login(username: string, password: string) {
  return requestData<UserLoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: { username, password },
  });
}

export function getMenu() {
  return requestData<MenuItem[]>({
    url: '/auth/menu',
    method: 'GET',
  });
}
