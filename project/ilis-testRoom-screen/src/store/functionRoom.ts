import { LabInfoDTO } from "@/types/functionRoom"
import { defineStore, storeToRefs } from "pinia"
import { useStore } from "./index"
import { parseUrl } from "@/utils/utils"
import { getConsignUnitInfo, getLaboratorInfo, getCustomLabScreen } from "@/api/testRoom.api"
const { screenConfig } = storeToRefs(useStore())

interface CustomTabDTO {
  id: string
  mainEntityId: string
  name: string
}
let timer: any = null
export const functionRoomStore = defineStore("functionRoom", {
  persist: true,
  state: () => {
    return {
      unitName: "",
      labInfo: {} as LabInfoDTO, // 功能室绑定的试验室信息
      customTabs: [] as CustomTabDTO[] // 功能室管理配置的关联屏文件信息
    }
  },
  actions: {
    getLabId() {
      // 座式屏查看门口屏弹窗嵌入逻辑
      const hrefPar = parseUrl(location.href) as any
      if (hrefPar.functionRoomCheckId && hrefPar.labId) {
        return hrefPar.labId
      }

      if (!screenConfig.value.url) return ""
      const urlPar = parseUrl(screenConfig.value.url) as any
      return screenConfig.value.url ? urlPar.labId : ""
    },
    async initRoomData() {
      try {
        this.getConsignUnitInfoFun()
        await this.getLabInfo()
        await this.getCustomTabs()
      } catch (err) {
        return Promise.reject(err)
      }
    },
    // 获取委托单位
    getConsignUnitInfoFun() {
      getConsignUnitInfo().then((res) => {
        if (res.code === 20000) {
          const unitName = res.data.unitName
          this.unitName = unitName
        }
      })
    },
    // 获取试验室信息
    async getLabInfo() {
      const labId = this.getLabId()
      return await getLaboratorInfo(labId)
        .then((res) => {
          this.startTimer()
          if (res.code === 20000) {
            res.data.iconUrl = res.data.iconUrl ? res.data.iconUrl.split("&&") : []
            this.labInfo = res.data
            return res.data
          }
          return Promise.reject(res)
        })
        .catch((err) => {
          this.startTimer()
          return Promise.reject(err)
        })
    },
    // 获取自定义屏信息：标签页内容
    async getCustomTabs() {
      return await getCustomLabScreen({ laboratoryScreenId: this.labInfo.id })
        .then((res) => {
          if (res.code === 20000) {
            this.customTabs = res.data || []
            return res.data
          } else {
            return Promise.reject(res)
          }
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    /**
     * 开启定时器：定时刷新数据,子组件依赖labInfo的数据,所以切换tab时不应关闭自动刷新功能
     **/
    startTimer() {
      if (!screenConfig.value.frequencyRefresh) return
      timer && clearInterval(timer)
      timer = setInterval(() => {
        this.initRoomData()
      }, screenConfig.value.frequencyRefresh * 1000)
    }
  }
})
