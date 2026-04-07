import { defineStore } from "pinia"
import {
  getScreenAuthConfig,
  ScreenAuthConfigDTO,
  getCustomLabTemplate
} from "@/api/functionRoom2.api"
import { useStore } from "./index"
import { ILabDataRes } from "@/interface/ILaboratory"

interface CustomComponentDTO {
  id: string
  mainEntityId: string
  name: string
}

export const functionRoom2Store = defineStore("functionRoom2", {
  persist: true,
  state: () => {
    return {
      authConfig: {} as ScreenAuthConfigDTO,
      customComponent: [] as CustomComponentDTO[],
      labData: {} as ILabDataRes
    }
  },
  actions: {
    /**
     * 初始化设备屏授权操作配置
     * 每10分钟更新下
     */
    async initAuthConfig() {
      const res = await getScreenAuthConfig()
      this.authConfig = res.data

      setTimeout(() => {
        this.initAuthConfig()
      }, 10 * 60 * 1000)
    },
    // 获取自定义组件
    async getCustomCompoent() {
      const { screenConfig } = useStore()
      return await getCustomLabTemplate({ laboratoryScreenId: screenConfig.businessId })
        .then((res) => {
          if (res.code === 20000) {
            this.customComponent = res.data || []
            return res.data
          } else {
            return Promise.reject(res)
          }
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }
  }
})
