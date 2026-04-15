import { defineStore } from 'pinia';
import type { UserRole } from '@packages/shared';

const ROLE_KEY = 'userRole';
const USER_ID_KEY = 'userId';
const USERNAME_KEY = 'username';
function readRole(): UserRole {
  const r = localStorage.getItem(ROLE_KEY);
  return r === 'ADMIN' || r === 'USER' ? r : 'USER';
}

export const useUserStore = defineStore('user', {
  state: () => ({
    role: readRole() as UserRole,
    userId: localStorage.getItem(USER_ID_KEY) ?? '',
    username: localStorage.getItem(USERNAME_KEY) ?? '',
  }),
  getters: {
    isAdmin: (s) => s.role === 'ADMIN',
  },
  actions: {
    setUser(user: { id: string; role: UserRole; username: string }) {
      this.userId = user.id;
      this.role = user.role;
      this.username = user.username;
      localStorage.setItem(ROLE_KEY, user.role);
      localStorage.setItem(USER_ID_KEY, user.id);
      localStorage.setItem(USERNAME_KEY, user.username);
    },
    setRole(role: UserRole) {
      this.role = role;
      localStorage.setItem(ROLE_KEY, role);
    },
    reset() {
      this.role = 'USER';
      this.userId = '';
      this.username = '';
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(USERNAME_KEY);
    },
  },
});
