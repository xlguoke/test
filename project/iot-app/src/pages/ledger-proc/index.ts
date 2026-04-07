import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import { AnyDictionaryHelper } from '@/utils/AnyDictionaryHelper'
import request from '@/utils/request'
import { toFormData } from 'axios'

export interface ILedger {
  id: '4028b2f49367d2b80193687674980035'
  temStatus: MStatus
  humStatus: MStatus
  type: 'MANUAL'
  recordDate: 1732797196000
  tem: 20
  hum: 80
  laboratoryId: '2c9120818ab58877018ab5b51bc20026'
  laboratoryName: 'xx室内'
  minTem: 10
  maxTem: 23
  minHum: 50
  maxHum: 75
  standardTem: '10.0~23.0'
  standardHum: '50.0~75.0'
  status: '10'
  handleContent: null
  handleUser: null
  handleDate: null
}

export enum LedgerStatusType {
  待处理 = '10',
  审核中 = '20',
  已退回 = '30',
  已完成 = '40',
}

export const LedgerStatusTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '待处理', key: LedgerStatusType.待处理 },
  { label: '审核中', key: LedgerStatusType.审核中 },
  { label: '已退回', key: LedgerStatusType.已退回 },
  { label: '已完成', key: LedgerStatusType.已完成 },
])

/**
 * 湿度状态 OVER超标 NORMAL正常 LOWER过低
 */
export enum MStatus {
  过低 = 'LOWER',
  正常 = 'NORMAL',
  超标 = 'OVER',
}

/** 湿度状态下拉 */
export const MStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '超标', key: MStatus.超标 },
  { label: '正常', key: MStatus.正常 },
  { label: '超标', key: MStatus.过低 },
])

export function getHumitureRecordList(data: Record<string, any>) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/record/page` : `/api/indoor-screen/humiture/record/page`
  return request.get<any>(apiUrl, {
    params: data,
  })
}

export interface SubmitHumRecordEntity {
  formPropertyJson: string
  handleContent: string
  id: string
  presetAuditers: string
}

export function submitHumRecord(data: SubmitHumRecordEntity) {
  return request.post<any>('rest/humiture/record?submit', toFormData(data))
}

export function getHumitureRecordDetail(id: string) {
  return request.get<ILedger>(`rest/humiture/record/${id}`)
}
