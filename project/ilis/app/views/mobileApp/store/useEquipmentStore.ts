import { defineStore } from 'pinia'

export const useEquipmentStore = defineStore('appEquipment', {
  state: () => {
    return {
      eqIds: [],
      eqDataList: [],
      testTaskDetail: {
        taskId: '',
        paramId: '',
        paramObjectId: '',
        selectedEq: [], // 选中的设备id
        equipmentList: [], // 设备列表
      },
      // 扫码添加设备时，更新参数列表
      scanAddEquipment: {
        selectedEq: [], // 选中的设备id
        equipmentList: [], // 设备列表
      },
      autoScanConf: {
        index: -1,
        count: 0,
        isAuto: false,
      },
    }
  },
  actions: {
    updateEqData(data: any) {
      data.forEach((d) => {
        d.eqRange = d.eqRange ? d.eqRange : '/'
        d.accuracy = d.accuracy ? d.accuracy : '/'
        d.nextCheckDate = d.nextCheckDate ? new Date(d.nextCheckDate).toLocaleDateString() : ''
      })
      const eqIds = data.map(d => d.id)
      this.eqIds = eqIds
      this.eqDataList = data
    },
    clearEqData() {
      this.eqIds = []
      this.eqDataList = []
    },
    setTestTaskDetail(data: any) {
      const newData = JSON.parse(JSON.stringify(data))
      this.testTaskDetail = { ...this.testTaskDetail, ...newData }
    },
  },
})
