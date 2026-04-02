import type { Directive } from 'vue';
import { useUserStore } from '@/stores/user';

type PermissionValue = string[]; // 例如 ['ADMIN']

export const permission: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    const allowed = binding.value || [];
    const user = useUserStore();
    const ok = allowed.includes(user.role);
    if (!ok) el.remove();
  },
};
