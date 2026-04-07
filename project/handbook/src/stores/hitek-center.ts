import { defineStore } from 'pinia'

export const useHitekCenterStore = defineStore('hitekCenter', {
  state: () => {
    return {
      // 接口地址，例如8300
      api: '',
      // web地址，例如8301
      udr: '',
    }
  },
})
