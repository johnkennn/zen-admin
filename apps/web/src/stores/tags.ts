import { defineStore } from 'pinia';

export type Tag = {
  title: string;
  fullPath: string;
  path: string;
  name?: string | symbol;
  affix?: boolean;
};

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [] as Tag[],
    refreshKey: 0, // 用来刷新当前页面
  }),
  actions: {
    add(tag: Tag) {
      if (this.tags.some((t) => t.fullPath === tag.fullPath)) return;
      this.tags.push(tag);
    },
    remove(fullPath: string) {
      const current = this.tags.find((t) => t.fullPath === fullPath);
      if (current?.affix) return;
      this.tags = this.tags.filter((t) => t.fullPath !== fullPath);
    },
    clear() {
      this.tags = this.tags.filter((t) => t.affix);
    },
    clearOthers(currentFullPath: string) {
      this.tags = this.tags.filter(
        (t) => t.affix || t.fullPath === currentFullPath,
      );
    },
    refresh() {
      this.refreshKey++;
    },
  },
});
