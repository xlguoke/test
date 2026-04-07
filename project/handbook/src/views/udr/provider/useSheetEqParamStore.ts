/**
 * 记录表->设备->选中参数，保存设备使用记录到对应参数
 */
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import type { IotDeviceDto } from '../modules/equipment-collection'
import type { TaskParam } from '@/type/equipment-use-register'

export const useSheetEqParamStore = defineStore('sheet-eq-param', {
  state: (): {
    eqiumentParamUseRecordList: Array<{
      startUseTime: string
      sheetName: string
      equipment: IotDeviceDto
      taskParam: TaskParam
    }>
  } => ({
    eqiumentParamUseRecordList: [],
  }),
  actions: {
    /**
     * 添加使用记录
     * @param sheetName 表单名称
     * @param equipment 设备信息
     * @param taskParam 参数信息
     */
    addSheetEqParamRecord(sheetName: string, equipment: IotDeviceDto, taskParam: TaskParam) {
      this.eqiumentParamUseRecordList.push({
        startUseTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        sheetName,
        equipment,
        taskParam,
      })
    },
  },
})
