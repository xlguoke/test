import { defineStore } from 'pinia'
import type { SelDataItemDTO } from '@/type/common'

const selDataCached = defineStore('selDataCached', {
  state: () => ({
    // 选中数据临时存储
    dataCached: {
      // 使用选择数据页面的路由name作为key
      SelParam: [],
      SelStandard: [],
    } as any,
    // 默认值 - 选中数据回显
    defaultData: {} as any,
    componentKey: 0,
  }),
  actions: {
    addSelData(name: string, data: any) {
      this.dataCached[name] = data
    },
    getSelData(name: string) {
      return this.dataCached[name]
    },
    addDefaultSelData(name: string, data: SelDataItemDTO[]) {
      this.defaultData[name] = data
    },
    getDefaultSelData(name: string) {
      const datas = this.defaultData[name]
      delete this.defaultData[name]
      return datas
    },
  },
  persist: {
    paths: [],
  },
})

export default selDataCached
