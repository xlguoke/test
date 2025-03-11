import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'

export interface HumitureSetParams {
  iotEqId?: string
  laboratoryId?: string
  type?: 'tem' | 'hum'
  minTem?: number
  maxTem?: number
  minHum?: number
  maxHum?: number
}

/** 控制功能室环境设备 */
export function humitureSet(data: HumitureSetParams) {
  return IlisApiHelper.post<IResponseCommonEntity<string>>('rest/humiture/display/set', data)
}

/** 根据物联网房间获取设备 */
export function getIots(id: string) {
  return IlisApiHelper.get<IResponseCommonEntity<any>>(`rest/eq/iots/env/${id}`)
}

/** 获取功能室详情 */
export function getIotLabDetail(id: string) {
  return IlisApiHelper.get<IResponseCommonEntity<any>>(`rest/laboratory/controller/${id}`)
}
