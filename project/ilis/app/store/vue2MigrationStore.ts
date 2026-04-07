import { defineStore } from 'pinia'

/**
 * 用pina适配vue2中使用的vuex
 */
export const useVue2MigrationStore = defineStore('vue2DataStore', {
  state: () => {
    return {
      mergePDF: null,
      dataObj: {},
    }
  },
  actions: {
    setDataObj(data: any) {
      this.dataObj = JSON.parse(JSON.stringify(data))
    },
    addMergeFile(file: any) {
      this.mergePDF = file
    },
    clearMergeFile() {
      this.mergePDF = null
    },
  },
})
