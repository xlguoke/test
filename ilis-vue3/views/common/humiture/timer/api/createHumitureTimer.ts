import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { CreateType, CustomType, LaboratoryIotEqType, RestType, StatusType } from '~/views/common/humiture/timer'

/** 新增定时设置实体 */
export class CreateTimerSettingEntity {
  id?: string
  laboratoryIotEqType = LaboratoryIotEqType.功能室
  /** 控制类型 */
  customType = CustomType.设置温湿度
  /** 自定义（多个用逗号隔开） */
  customValue: string[] = []
  /** 湿度  */
  hum?: number
  maxHum?: number
  /** 实验室/调养箱 */
  laboratoryIotEqId?: string
  laboratoryId?: string
  /** 重复类型 */
  restType = RestType.不重复
  startDate?: string
  /** 状态 */
  status = StatusType.开启
  /** 温度 */
  tem?: number
  maxTem?: number
  type = CreateType.定时任务
  createName = ''
}

/** 新增 温湿度定时设置 */
export function createHumitureTimer(data: CreateTimerSettingEntity) {
  const params: any = { ...data }
  if (params.customValue) {
    params.customValue = params.customValue.join(',') || null
  }

  return IlisApiHelper.post<any>('rest/humiture', params)
}
