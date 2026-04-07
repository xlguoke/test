import { AnyDictionaryHelper } from '~/anyThing/helper/AnyDictionaryHelper'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 驾驶舱类型 */
export enum DashboardType {
  /** 物质设备 */
  EQ = 'EQ',
  /** 委托样品 */
  CONSIGN = 'CONSIGN',
  /** 材料检测 */
  TEST = 'TEST',
  /** 智能楼宇 */
  BUILDING = 'BUILDING',
}

export const dashboardTypeDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: DashboardType.EQ,
    label: '物质设备',
  },
  {
    key: DashboardType.CONSIGN,
    label: '委托样品',
  },
  {
    key: DashboardType.TEST,
    label: '材料检测',
  },
  {
    key: DashboardType.BUILDING,
    label: '智能楼宇',
  },
])

export interface ConfigList {
  id?: string
  labId?: string
  labName?: string
  type?: string
  model?: string
  labConfigId?: string
  labConfigName?: string
  labConfigIdArr: string[]
  labConfigNameArr: string[]
  isAddRow?: boolean
}

/** 获取视频配置列表 */
export function getVideoConfigList() {
  return IlisApiHelper.get<ConfigList[]>('/rest/laboratory/dashboard')
}

/** 保存视频配置 */
export function saveVideoConfig(data: ConfigList[]) {
  return IlisApiHelper.post('/rest/laboratory/dashboard', data)
}
