import { defineStore } from 'pinia'

export const useTaskAssignStore = defineStore('appTaskAssign', {
  state: () => {
    return {
      taskAssignData: {},
    }
  },
  actions: {},
})
