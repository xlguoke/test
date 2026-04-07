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
    /**
     * 设置默认选中项
     * @param {string} name 待选数据页面路由名称
     * @param {SelDataItemDTO[]} data 已选数据列表
     */
    addDefaultSelData(name: string, data: SelDataItemDTO[]) {
      this.defaultData[name] = data
    },
    /**
     * 获取缓存的选中数据
     * @param name
     */
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
