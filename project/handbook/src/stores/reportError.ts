import { defineStore } from 'pinia'

export const useReportErrorStore = defineStore('reportError', {
  state: () => {
    return {
      err: null as any | null,
      showReportedErrorDialog: false,
    }
  },
  actions: {
    showDialog(err: any) {
      this.showReportedErrorDialog = true
      this.err = err
    },
    closeDialog() {
      this.showReportedErrorDialog = false
      this.err = null
    },

  },
  persist: {
  },
})
