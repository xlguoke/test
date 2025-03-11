import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type {
  LaboratoryIotEqType,
} from '~/views/common/humiture/timer/index.ts'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import type { CommandWayType } from '~/views/common/humiture/log/index.ts'

/** 定时设置列表数据项 */
export interface HumitureLogDataItem {
  /** 物联网设备名称 */
  name: string
  /** 设备类型 LAB功能室 EQ设备 BOX调养箱 */
  iotEqType: LaboratoryIotEqType
  /** 功能室名称 */
  laboratoryName: string
  /** 控制时间 */
  createDate?: null
  type: string
  /** 控制方式 TIMER定时设置 RES预约控制 NOW即时控制 */
  commandWay: CommandWayType
  /** 控制结果 */
  reqStatus: string
  source?: string
  /** 操作人 */
  operator: string
  operationDate: number
  /** 控制内容 */
  content?: null
  /** 备注 */
  remark?: null
}

/** 定时设置列表过滤参数 */
export interface HumitureLogListParams {
  /** 控制方式 TIMER定时 RES预约 NOW立刻 */
  commandWay?: CommandWayType
  /** 控制结束时间 */
  conEndDate?: string
  /** 控制开始时间 */
  conStartDate?: string
  /** 功能室id */
  laboratoryId?: string
  /** 操作人 */
  operator?: string
  /** 请求结果 */
  reqStatus?: 'SUCCESS' | 'FAIL' | boolean
}

/** 定时设置列表 */
export function getHumitureLogList(data: HumitureLogListParams) {
  const params = { ...data }
  params.reqStatus = params.reqStatus === true ? 'FAIL' : undefined

  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureLogDataItem>>('rest/humiture/log/page', params)
}
