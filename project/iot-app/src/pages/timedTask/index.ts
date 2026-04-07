import { AnyDictionaryHelper } from '@/utils/AnyDictionaryHelper'
import type { StatusType } from '../room'
import request from '@/utils/request'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'

export interface ITimedTask {
  id: '4028b2f4934e0f6d01934e55b825001f'
  testTaskId: null
  laboratoryId: '2c9120818ab58877018ab5b5825f0028'
  laboratoryName: '功能室'
  laboratoryIotEqName: '试验室1'
  laboratoryIotEqId: '4028b242934c737601934c79cc52000a'
  laboratoryIotEqType: 'LAB'
  testTaskCode: null
  testSampleDisplayName: null
  paramList: []
  type: 'TIMER'
  status: StatusType
  restType: RestType
  customType: CustomType
  customValue: ''
  startDate: 1732186054000
  endDate: null
  tem: number
  hum: number
  maxTem: number
  maxHum: number
  createName: '管理员'
  resUserName: '管理员'
  resUserId: '8a8ab0b246dc81120146dc8181950052'
}

/** 重复类型 */
export enum RestType {
  不重复 = 'NO',
  工作日 = 'WEEKDAY',
  自定义 = 'CUSTOM',
}

/** 重复类型下拉 */
export const RestTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '不重复', key: RestType.不重复 },
  { label: '工作日', key: RestType.工作日 },
  { label: '自定义', key: RestType.自定义 },
])

/** 控制类型 */
export enum CustomType {
  开启 = 'OPEN',
  关闭 = 'CLOSE',
  设置温湿度 = 'SET',
}

/** 控制类型下拉 */
export const CustomTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '设置温湿度', key: CustomType.设置温湿度 },
  { label: '开启', key: CustomType.开启 },
  { label: '关闭', key: CustomType.关闭 },
])

/** 删除 温湿度定时设置 */
export function delHumitureTimer(id: string) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/${id}` : `/api/indoor-screen/humiture/${id}`
  return request.delete<any>(apiUrl)
}

/** 启停控制定时设置 */
export function switchHumiture(id: string, status: StatusType) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/${id}/${status}` : `/api/indoor-screen/humiture/timer/${id}/${status}`
  return request.put<any>(apiUrl)
}

/** 新增 温湿度定时设置 */
export function createHumitureTimer(params: Record<string, any>) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture` : `/api/indoor-screen/humiture/timer`
  return request.post<any>(apiUrl, params)
}

/** 编辑 温湿度定时设置 */
export function editHumitureTimer(params: Record<string, any> & { id: string }) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/humiture/${params.id}` : `/api/indoor-screen/humiture/timer/${params.id}`
  return request.put<any>(apiUrl, params)
}
