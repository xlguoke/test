import { defineStore } from 'pinia'

export const useCountDownStore = defineStore('countDown', {
  state: () => {
    return {
      countDownMap: {} as Record<string, number>,
    }
  },
  actions: {
    addCountDown(key: string) {
      this.countDownMap[key] = 0
    },
    removeCountDown(item: any) {
      delete this.countDownMap[item]
    },
    clearCountDown() {
      this.countDownMap = {}
    },
    startCountDown(key: string, num: number) {
      if (this.countDownMap[key]) {
        this.countDown(key)
        return
      }
      this.addCountDown(key)
      this.countDownMap[key] = num
      this.countDown(key)
    },
    countDown(key: string) {
      setTimeout(() => {
        if (this.countDownMap?.[key] > 0) {
          this.countDownMap[key]--
          this.countDown(key)
        }
        else {
          this.removeCountDown(key)
        }
      }, 1000)
    },
  },
})
