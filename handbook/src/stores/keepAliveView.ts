import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

const cachedViewStore = defineStore('cache-route', {
  state: () => ({
    cachedViews: [] as string[],
  }),
  actions: {
    addCachedView(route: RouteRecordRaw) {
      const _name = route.name as string
      if (!route || !route.meta?.keepAlive || this.cachedViews.includes(_name))
        return
      this.cachedViews.push(_name)
    },
    removeCachedView(route: RouteRecordRaw) {
      const _name = route.name as string
      const ind = this.cachedViews.indexOf(_name)
      if (ind === -1)
        return
      this.cachedViews.splice(ind, 1)
    },
  },
  persist: {
    paths: [],
  },
})

export default cachedViewStore
