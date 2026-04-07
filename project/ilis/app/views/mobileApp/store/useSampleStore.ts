import { defineStore } from 'pinia'

export const useSampleStore = defineStore('appSample', {
  state: () => {
    return {
      sampleInfo: {},
      sampleStorageInfo: {},
      // 标养室出入库信息
      standardCuringStorageInfo: [],
      // 取样台账批量进行蓝牙打印时的数据
      samplingPrintList: [],
    }
  },
  actions: {},
})
