import { getScreenConfig } from "@/api/binding.api"
import { IScreenConfig } from "@/interface/IScreenConfig"
import { defineStore } from "pinia"
import { getUrlParam } from "@/utils/utils"
import { androidTools } from "@/utils/AndroidTools"

let timer: any = null
export const useStore = defineStore("screenConfig", {
  persist: [
    {
      key: "screenConfig",
      storage: localStorage,
      paths: ["screenConfig"]
    }
  ],
  state: () => {
    return {
      screenConfig: {} as IScreenConfig,
      isUpdateConf: false as boolean
    }
  },
  getters: {
    isReadOnly() {
      return getUrlParam("readOnly") === "1"
    }
  },
  actions: {
    getUnitCode() {
      return getUrlParam("unitCode") || localStorage.getItem("unitCode") || ""
    },
    removeUnitCode() {
      localStorage.removeItem("unitCode")
    },
    getScreenNo() {
      return getUrlParam("screenNo") || localStorage.getItem("bigScreenNo") || ""
    },
    // 获取大屏配置
    async getScreenConfigAction(): Promise<string> {
      const { data, code } = await getScreenConfig(this.getScreenNo())
      if (code !== 20000 || !data || !data.url) return ""
      this.screenConfig = data
      this.refreshTimer()

      // 重启APP
      if (data.needRestart === true) {
        androidTools.restartApp()
      }

      return data.url
    },
    // 是否有大屏配置，无配置时返回空字符串
    async hasScreenConfig(): Promise<string> {
      const unitCode = this.getUnitCode()
      const screenNo = this.getScreenNo()
      if (unitCode && screenNo) {
        localStorage.setItem("unitCode", unitCode)
        localStorage.setItem("bigScreenNo", screenNo)
        // 本地有单位编码和大屏编号，获取最新配置
        return await this.getScreenConfigAction()
      }
      return ""
    },
    clearTimer() {
      timer && clearTimeout(timer)
    },
    // 定时刷新配置
    refreshTimer() {
      this.clearTimer()
      timer = setTimeout(async () => {
        try {
          await this.getScreenConfigAction()
        } catch (er) {
          console.log(er)
        }
      }, 60 * 1000)
    },
    getIsUpdateConf() {
      return sessionStorage.getItem("isUpdateConf") === "true"
    },
    setIsUpdateConf(bol) {
      sessionStorage.setItem("isUpdateConf", bol)
    }
  }
})
