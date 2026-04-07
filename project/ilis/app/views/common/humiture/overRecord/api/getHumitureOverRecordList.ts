import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import type { HumOverType } from '~/views/common/humiture/overRecord'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 定时设置列表数据项 */
export interface HumitureOverRecordDTO {
  id: string
  laboratoryId: string // 功能室id
  laboratoryName: string // 功能室名称
  type: HumOverType // 超标类型 TEM温度 HUM湿度 ALL都超标
  mark: string
  testTaskHisId?: string
  testTaskCode: string // 任务编号
  testSampleCode: string // 样品编号
  testSampleName: string // 样品名称
  testParamName: string // 参数名称
  taskUser: string // 试验人员
  recordDate: number // 记录时间
  tem: number
  hum: number
  standardMinTem: number
  standardMaxTem: number
  standardMinHum: number
  standardMaxHum: number
}

export interface GetHumitureOverRecordListQuery {
  /**
   * 控制结束时间
   */
  endDate?: string
  isPager?: boolean
  /**
   * 功能室id
   */
  laboratoryId?: string
  /**
   * 排序方式(正序-ASC/倒序-DESC)
   */
  order?: string
  /**
   * 排序列
   */
  orderBy?: string
  /**
   * 页码
   */
  page?: number
  /**
   * 快速查询参数
   */
  quickQry?: string
  /**
   * 每页条数
   */
  size?: number
  /**
   * 控制开始时间
   */
  startDate?: string
}

/** 超标台账列表 */
export function getHumitureOverRecordList(data: GetHumitureOverRecordListQuery) {
  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureOverRecordDTO>>('rest/humiture/over/record/page', data)
}
