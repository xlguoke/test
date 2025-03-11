import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { LaboratoryIotEqType } from '~/views/common/humiture/timer/index.ts'
import { CustomType } from '~/views/common/humiture/res'

/** 新增预约实体 */
export class CreateHumitureResEntity {
  id?: string
  /** 控制类型 CLOSE关闭 SET设置温湿度 */
  customType = CustomType.不处理
  /** 结束时间 */
  endDate?: string
  /** 湿度 */
  hum?: number
  maxHum?: number
  /** 功能室id */
  laboratoryId?: string
  /** 调养箱 */
  laboratoryIotEqId?: string
  /** 预约类型 */
  laboratoryIotEqType = LaboratoryIotEqType.功能室
  /** 预约人员id */
  resUserId?: string
  /** 开始时间 */
  startDate?: string
  /** 任务id */
  taskId?: string
  /** 温度 */
  tem?: number
  maxTem?: number
  createName = ''
  boxName = ''
  testParams: string[] = []
}

/** 温湿度预约新增 */
export function createHumitureRes(data: CreateHumitureResEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/humiture/res', {
    ...data,
    testParams: data.testParams ? data.testParams.join(',') : '',
  })
}
