import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type {
  CustomType,
  LaboratoryIotEqType,
  RestType,
} from '~/views/common/humiture/timer/index.ts'
import {
  CreateType,
  StatusType,
} from '~/views/common/humiture/timer/index.ts'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'

/** 定时设置列表数据项 */
export interface HumitureTimerDataItem {
  id: string
  testTaskId?: string
  laboratoryIotEqName: string
  laboratoryIotEqId: string
  laboratoryIotEqType: LaboratoryIotEqType
  testTaskCode?: string
  testSampleDisplayName?: string
  paramList?: any[]
  type: CreateType
  status: StatusType
  restType: RestType
  customType: CustomType
  customValue?: string
  startDate: number
  endDate?: number
  tem: number
  hum: number
}

/** 定时设置列表过滤参数（高级查询） */
export class HumitureTimerListAdvancedParams {
  /** 设置人员 */
  createName?: string
  /** 任务编号 */
  testTaskCode?: string
  /** 定时控制结束时间 */
  timerEndDate?: string
  /** 定时控制开始时间 */
  timerStartDate?: string
  /** 预约结束时间 */
  resEndDate?: string
  /** 预约开始时间 */
  resStartDate?: string
}

/** 定时设置列表过滤参数 */
export class HumitureTimerListParams extends HumitureTimerListAdvancedParams {
  /** 实验室/调养箱id */
  laboratoryIotEqId?: string
  'laboratory.id'?: string
  /** 仅展示自己的 */
  onlyOne?: boolean
  /** 状态 OPEN开启 CLOSE关闭 */
  status?: boolean | StatusType
  /** 类型 RES预约 TIMER定时任务 */
  type = CreateType.定时任务
}

/** 定时设置列表 */
export function getHumitureTimerList(data: HumitureTimerListParams) {
  const params = { ...data }
  params.status = params.status ? StatusType.开启 : undefined

  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureTimerDataItem>>('rest/humiture/page', params)
}
