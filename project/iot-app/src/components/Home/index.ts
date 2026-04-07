import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import request from '@/utils/request'

// 控制类型
export enum IotControllType {
  温度 = 'tem',
  湿度 = 'hum',
  所有 = 'all',
}

export enum IotStatusType {
  开 = 1,
  关 = 0,
}

export interface HumitureParams {
  tem?: number
  hum?: number
}

/** 控制功能室环境设备 */
export function humitureControll(id: string, type: IotControllType, status: IotStatusType, params?: HumitureParams) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/display/${id}/${type}/${status}` : `/api/indoor-screen/humiture/con/${id}/${type}/${status}`
  return request.get<any>(apiUrl, {
    params,
  })
}

export interface HumitureSetParams {
  iotEqId?: string
  laboratoryId?: string
  type?: string
  minTem?: number
  maxTem?: number
  minHum?: number
  maxHum?: number
}

/** 控制功能室环境设备 */
export function humitureSet(data: HumitureSetParams) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/display/set` : `/api/indoor-screen/humiture/con/set`
  return request.post<any>(apiUrl, data)
}

/** 控制功能室温湿度-恒温控制 */
export function humitureTemSet(data: HumitureSetParams) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/display/set` : `/api/indoor-screen/humiture/con/set`
  return request.post<any>(apiUrl, data)
}

/** 关闭功能室恒温控制 */
export function humitureTemClose(data: HumitureSetParams) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/humiture/display/close` : `/api/indoor-screen/humiture/con/close`
  return request.post<any>(apiUrl, data)
}
