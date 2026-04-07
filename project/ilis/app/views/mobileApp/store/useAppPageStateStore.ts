import { defineStore } from 'pinia'

interface PageState {
  [key: string]: Record<string, any>
}

export const useAppPageStateStore = defineStore('appPageState', {
  state: (): PageState => {
    return {}
  },
  actions: {
    getPage(routeName: string, params?: Record<string, any>): Record<string, any> {
      if (!this[routeName]) {
        this[routeName] = params || {}
      }
      return this[routeName]
    },
  },
})
