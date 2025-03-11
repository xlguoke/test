import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'

/** 定时设置列表数据项 */
export interface HumitureLedgerDataItem {
  ledgerSn: '2024-11-0001' // 台账编号
  name: '998' // 台账名称
  laboratoryName: 'xx室内xx室内' // 功能室
  ledgerEndDate: 1731427200000// 结束时间
  id: '4028b24293233d350193235a34d50022'
  createName: '管理员' // 创建人
  ledgerStartDate: 1707667200000// 开始时间
  status: '10' // 状态 10待提交 20审核中 30审核不通过 40审核通过
  createDate: 1731464935000// 创建时间
}

export interface HumitureLedgerListParams {
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
   * 快速查询参数 （编号、名称、创建人）
   */
  quickQry?: string
  /**
   * 每页条数
   */
  size?: number
  /**
   * 状态 10待提交 20审核中 30审核不通过 40审核通过
   */
  status?: string
}

/** 巡查列表 */
export function getHumitureLedgerList(data: HumitureLedgerListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<HumitureLedgerDataItem>>('rest/humiture/ledger/page', data)
}
