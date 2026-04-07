import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import type { IotControllType, IotStatusType } from '~/views/common/humiture/display/index.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface HumitureParams {
  tem?: number
  hum?: number
}
export interface IotDeviceThreshold {
  iotEqId?: string // 主键id
  laboratoryId?: string // 功能室id
  type?: 'tem' | 'hum' | 'all' // 类型：温度、湿度、所有
  minTem?: number // 最低温度
  maxTem?: number // 最高温度
  minHum?: number // 最低湿度
  maxHum?: number // 最高湿度
}

/** 控制功能室环境设备 */
export function humitureControll(id: string, type: IotControllType, status: IotStatusType, params?: HumitureParams) {
  return IlisApiHelper.get<IResponseCommonEntity<string>>(`rest/humiture/display/${id}/${type}/${status}`, params)
}

/** 控制所有功能室 恒温恒湿开关 */
export function humitureAllControll(data: IotDeviceThreshold, status: IotStatusType) {
  return IlisApiHelper.post<IResponseCommonEntity<string>>(`rest/humiture/display/con/all/lab/${status}`, data)
}
/** 控制功能室温湿度-恒温控制 */
export function humitureTemSet(data: IotDeviceThreshold) {
  return IlisApiHelper.post<IResponseCommonEntity<string>>(`rest/humiture/display/set`, data)
}

/** 关闭功能室恒温控制 */
export function humitureTemClose(data: IotDeviceThreshold) {
  return IlisApiHelper.post<IResponseCommonEntity<string>>(`rest/humiture/display/close`, data)
}
