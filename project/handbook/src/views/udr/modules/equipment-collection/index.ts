export { default as EquipmentPanel } from './EquipmentPanel.vue'

export enum EquipmentType {
  主设备 = 'COLLECT_MAIN',
  量具 = 'MEASURE',
}

export interface SelectType {
  text: string
  value: EquipmentType
}

export const selectActions: SelectType[] = [
  { text: '量具', value: EquipmentType.量具 },
  { text: '主设备', value: EquipmentType.主设备 },
]

export enum EqConnectionType {
  直连 = 'DIRECT',
  蓝牙 = 'BLUETOOTH',
}

export interface IotDeviceDto {
  id: string
  name: string
  descr: string
  mac: string
  type: EquipmentType
  active: boolean
  eqsn: string
  equipment: string
  equipmentId: string
  laboratoryName: string
  measureEqType: string
  connectionType: EqConnectionType

  // 前端自定义字段
  /** 用于标识订阅或连接蓝牙是否已连接 */
  connected: boolean
  /** 主设备采集历史 */
  jsonDataList: any[]
}

// 主设备实体
export interface MainDeviceDto {
  id: string
  sysCompanyCode: null
  createName: null
  createBy: null
  createDate: '2022-10-27 19:25:07'
  updateName: '管理员'
  updateBy: 'admin'
  updateDate: '2025-08-04 15:52:42'
  unitCode: null
  isDelete: '0'
  isReport: '1'
  untilCode: 'sgjc'
  yangpbh: string
  sbbianhao: string
  sbmingcheng: string
  gongcbw: null
  jcshijian: '2022-10-27 19:23:19'
  dots: null
  uuid: '2CAB70CA-9D03-40B3-8FF8-E6212A2A98E3'
  testTypeCode: '7'
  testTypeId: '402882586f1c0124016f1c01aca60001'
  testType: '混凝土抗压'
  taskId: '297e85c2992c27ce01992c481bac011c'
  jsonData: string
  companyCode: null
  platformMark: 'QDM'
  pushStatus: null
  pushTime: null
  pushUser: null
  collectTime: null
  collectOrder: 5
  shijianbh: null
  isHeGe: 'True'
  yunit: null
  xunit: null
  measureEqType: string
  name: string
  jsonDataList: any[]
}

export interface IotDeviceRecordDTO {
  id?: string
  ts: number
  value: string
}

export interface UdrIotDataCollect {
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 设备名称
   */
  deviceName: string
  /**
   * 应用的数据
   */
  data: Array<string>
  /**
   * 设备类型名称
   */
  deviceTypeName: string
}

export interface IotDeviceCollectionDTO {
  allowedEntities: number
  cmdId: number
  cmdUpdateType: string
  data: {
    data: [{
      entityId: {
        entityType: string
        id: string
      }
      latest: {
        TIME_SERIES: {
          unit: {
            ts: number
            value: string
          }
          online: {
            ts: number
            value: string
          }
          value: {
            ts: number
            value: string
          }
        }
      }
    }]
    hasNext: boolean
    totalElements: number
    totalPages: number
  }
  errorCode: any
  update: any
}
