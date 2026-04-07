import { defineStore } from 'pinia'
import { EquipmentType, type IotDeviceDto } from '../modules/equipment-collection'

/**
 * 设备数据采集
 */
const useDeviceDataCollectionStore = defineStore('deviceDataCollectionStore', {
  state: (): {
    /** 显示设备采集面板 */
    showEqPanel: boolean

    /** 当前使用的数据采集设备 */
    inUseCollectionDevice: IotDeviceDto | null

    /**
     * 采集过程记录
     * 使用手簿期间，连接设备产生的采集数据，最后要保存到后端，该对象用于保存设备和使用时间，最后根据使用时间从物联网上获取采集的数据
     */
    collectionRecordMap: {
      [key: string]: number
    }
  } => ({
    showEqPanel: false,
    inUseCollectionDevice: null,
    collectionRecordMap: {},
  }),
  actions: {
    // 初始化
    // 由于设备存在设备选中等状态，如果离开该页面，需要，重新进入，直接初始化相关状态
    async init() {
      this.showEqPanel = false
      this.inUseCollectionDevice = null
    },
    // 记录使用设备
    async reocrdUseDevice(item: IotDeviceDto) {
      if (item.type === EquipmentType.主设备)
        return

      if (!this.collectionRecordMap[item.id])
        this.collectionRecordMap[item.id] = new Date().getTime()
    },
  },
})

export { useDeviceDataCollectionStore }
