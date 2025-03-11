import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import type { MStatus, Type } from '~/views/common/humiture/record'
import { LedgerStatusType } from '~/views/common/humiture/ledger'

/** 定时设置列表数据项 */
export interface HumitureRecordDataItem {
  id: '1'
  temStatus: MStatus// 温度状态 OVER超标 NORMAL正常 LOWER过低
  humStatus: MStatus// 湿度状态 OVER超标 NORMAL正常 LOWER过低
  type: Type// 巡查模式 AUTO自动 MANUAL手动
  recordDate: 1731340800000// 记录日期
  tem: 21// 温度
  hum: 48// 湿度
  laboratoryId: '2c9120818ab58877018ab5b51bc20026'
  laboratoryName: 'xx室内' // 功能室
  minTem: 10
  maxTem: 23
  minHum: 50
  maxHum: 75
  standardTem: '10.0~23.0' // 标准温度
  standardHum: '50.0~75.0' // 标准湿度
  status: '10' // 状态 10待提交 20审核中 30审核不通过 40审核通过
  handleContent?: string
  handleDate?: string
  handleUser?: string
}

export interface HumitureRecordListParams {
  /**
   * 是否只看异常数据
   */
  abnormal?: boolean
  /**
   * 功能室
   */
  laboratoryId?: string
  // 回显用
  laboratoryName?: string
  /**
   * 排序方式(正序-ASC/倒序-DESC)
   */
  order?: 'ASC' | 'DESC'
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
   * 记录结束时间
   */
  recordEndDate?: string
  /**
   * 记录开始时间
   */
  recordStartDate?: string
  /**
   * 每页条数
   */
  size?: number
  /**
   * 巡查模式 AUTO自动 MANUAL手动
   * AUTO :自动
   * MANUAL :手动
   */
  type?: Type
  status?: LedgerStatusType | boolean
}

/** 巡查列表 */
export function getHumitureRecordList(data: HumitureRecordListParams) {
  if (data.status === true) {
    data.status = LedgerStatusType.待提交
  }
  if (data.status === false) {
    data.status = undefined
  }

  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureRecordDataItem>>('rest/humiture/record/page', data)
}
