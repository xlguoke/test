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
import type { CommandWayType } from '~/views/common/humiture/log/index.ts'

/** 定时设置列表数据项 */
export interface HumitureResDataItem {
  id: string
  /** 任务id */
  testTaskId: string
  /** 设备名称 */
  laboratoryIotEqName: string
  /** 设备id */
  laboratoryIotEqId: string
  /** 设备类型  LAB功能室 EQ设备 BOX调养箱 */
  laboratoryIotEqType: LaboratoryIotEqType
  /** 任务编号 */
  testTaskCode: string
  /** 样品名称 */
  testSampleDisplayName: string
  /** 检测参数 */
  paramList?: any
  type: CommandWayType
  status: StatusType
  restType: RestType
  customType: CustomType
  customValue?: string
  /** 开始时间 */
  startDate?: number
  /** 结束时间 */
  endDate?: number
  /** 温度 */
  tem: number
  /** 湿度 */
  hum: number
  resUserName: string
}

/** 定时设置列表过滤参数 */
export class HumitureResListParams {
  /** 设置人员 */
  createName?: string
  /** 实验室/调养箱id */
  laboratoryIotEqId?: string
  'laboratory.id'?: string
  /** 仅展示自己的 */
  onlyOne?: boolean
  /** 预约结束时间 */
  resEndDate?: string
  /** 预约开始时间 */
  resStartDate?: string
  /** 状态 OPEN开启 CLOSE关闭 */
  status?: boolean | StatusType
  /** 任务编号 */
  testTaskCode?: string
  /** 定时控制结束时间 */
  timerEndDate?: string
  /** 定时控制开始时间 */
  timerStartDate?: string
  /** 类型 RES预约 TIMER定时任务 */
  type = CreateType.预约

  /** 不看已过期的预约 */
  notBackIssue? = true
}

/** 温湿度预约控制列表 */
export function getHumitureResList(data: HumitureResListParams) {
  const params = { ...data }
  params.status = params.status ? StatusType.开启 : undefined
  params.notBackIssue = params.notBackIssue ? true : undefined
  params.onlyOne = params.onlyOne ? true : undefined

  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureResDataItem>>('rest/humiture/res/page', params)
}
