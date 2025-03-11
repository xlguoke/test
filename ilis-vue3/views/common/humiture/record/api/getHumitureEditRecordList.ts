import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'

/** 定时设置列表数据项 */
export interface HumitureEditRecordDataItem {
  createDate: 1731390806000// 修改时间
  createName: '管理员' // 修改人
  laboratoryName: 'xx室内' // 功能室
  value: '{"hum":50.0,"recordDate":"2024-02-12 13:57:02","tem":20.0}' // 修改前的值
  updateValue: '{"hum":52.0,"recordDate":"2024-02-12 13:57:02","tem":21.0}'// 修改后的值
}

export interface HumitureEditRecordListParams {
  /**
   * 排序方式(正序-ASC/倒序-DESC)
   */
  'order'?: string
  /**
   * 排序列
   */
  'orderBy'?: string
  /**
   * 页码
   */
  'page'?: number
  /**
   * 快速查询参数
   */
  'quickQry'?: string
  /**
   * 每页条数
   */
  'size'?: number
  /**
   * 修改结束时间
   */
  'updateEndDate'?: string
  /**
   * 修改开始时间
   */
  'updateStartDate'?: string
  'laboratory.id'?: string
}

/** 巡查修改记录 */
export function getHumitureEditRecordList(data: HumitureEditRecordListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureEditRecordDataItem>>('rest/humiture/record/log', data)
}
