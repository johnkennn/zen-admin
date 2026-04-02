import { defineStore } from 'pinia';
import type { UserRole } from '@packages/shared';

export const useUserStore = defineStore('user', {
  state: () => ({
    role: 'USER' as UserRole,
  }),
  actions: {
    setRole(role: UserRole) {
      this.role = role;
    },
    reset() {
      this.role = 'USER';
    },
  },
});
