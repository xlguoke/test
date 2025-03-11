import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import type { IotControllType, IotStatusType } from '~/views/common/humiture/display/index.ts'

export interface HumitureParams {
  tem?: number
  hum?: number
}

/** 控制功能室环境设备 */
export function humitureControll(id: string, type: IotControllType, status: IotStatusType, params?: HumitureParams) {
  return IlisApiHelper.get<IResponseCommonEntity<string>>(`rest/humiture/display/${id}/${type}/${status}`, params)
}
