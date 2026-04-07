/**
 * 化学品出库登记模块类型定义
 */

import type { StorageInListItem } from './storage-in'

/** 出库登记列表查询参数 */
export interface StorageOutListQueryParams {
  /** 每页数量 */
  size: number
  /** 页码 */
  page: number
  /** 搜索关键词 */
  quickQry?: string
  /** 出库时间开始 */
  storageOutTimeBegin?: string
  /** 出库时间结束 */
  storageOutTimeEnd?: string
  /** 出库人 */
  storageOutPerson?: string
  /** 领用人 */
  recipient?: string
  /** 状态 */
  status?: string
  /** 出库类型 */
  type?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方式: asc-升序 desc-降序 */
  order?: 'asc' | 'desc'
}

/** 出库登记列表项 */
export interface StorageOutListItem {
  /** 出库ID */
  id: string
  /** 化学品ID */
  chemicalId?: string
  /** 状态 */
  status: string
  /** 出库批号 */
  batchSn?: string
  /** 出库类型 */
  type?: string
  /** 化学品分类名称 */
  categoryName?: string
  /** 化学品编号 */
  sn?: string
  /** 化学品名称 */
  name: string
  /** 申请时间 */
  applyTime?: string
  /** 预计出库日期 */
  planOutboundDate?: string
  /** 预计归还日期 */
  planReturnDate?: string | null
  /** 领取部门 */
  receiveDepart?: string
  /** 领取部门ID */
  receiveDepartId?: string
  /** 领取人 */
  receivers?: string
  /** 领取人IDs */
  receiverIds?: string
  /** 申领数量 */
  amount?: number
  /** 剩余数量 */
  remainingAmount?: number
  /** 出库人 */
  outboundPersons?: string
  /** 出库人IDs */
  outboundPersonIds?: string
  /** 出库日期 */
  outboundDate?: string
  /** 关联任务IDs */
  testTaskIds?: string | null
  /** 关联任务编号 */
  testTaskCodes?: string | null
  /** 备注 */
  remark?: string | null
}

/** 出库化学品项 - 基于库存数据 */
export interface StorageOutChemicalItem extends StorageInListItem {
  /** 出库数量 */
  outQuantity?: number
}

/** 出库登记详情项 - 与PC端返回结构一致 */
export interface StorageOutDetailItem {
  /** 出库ID */
  id: string
  /** 化学品ID */
  chemicalId: string
  /** 出库编号 */
  storageOutNo?: string
  /** 出库批号 */
  batchSn?: string
  /** 出库类型 */
  type?: string
  /** 预计出库日期 */
  planOutboundDate?: string
  /** 预计归还日期 */
  planReturnDate?: string
  /** 领取部门 */
  receiveDepart?: string
  /** 领取部门ID */
  receiveDepartId?: string
  /** 领取人 */
  receivers?: string
  /** 领取人IDs */
  receiverIds?: string
  /** 出库人 */
  outboundPersons?: string
  /** 出库人IDs */
  outboundPersonIds?: string
  /** 出库日期 */
  outboundDate?: string
  /** 出库时间 */
  storageOutTime?: string
  /** 状态 */
  status: string
  /** 备注 */
  remark?: string
  /** 申领数量/出库数量 */
  amount?: number
  /** 化学品信息 */
  chemical: StorageOutChemicalItem
  /** 任务关联 */
  taskRelations?: { testTaskId: string, testTaskCode: string }[]
}

/** 出库登记详情 - 返回数组 */
export type StorageOutDetail = StorageOutDetailItem[]

/** 新增出库登记表单 - 与后端接口字段保持一致 */
export interface StorageOutAddForm {
  /** 出库ID（编辑时使用） */
  id?: string
  /** 化学品ID */
  chemicalId?: string
  /** 出库批号 */
  batchSn?: string
  /** 出库类型 */
  type?: string
  /** 预计出库日期 */
  planOutboundDate?: string
  /** 预计归还日期 */
  planReturnDate?: string
  /** 领取部门 */
  receiveDepart?: string
  /** 领取部门ID */
  receiveDepartId?: string
  /** 领取人 */
  receivers?: string
  /** 领取人IDs */
  receiverIds?: string
  /** 出库人 */
  outboundPersons?: string
  /** 出库人IDs */
  outboundPersonIds?: string
  /** 出库日期 */
  outboundDate?: string
  /** 关联任务IDs */
  testTaskIds?: string
  /** 关联任务编号 */
  testTaskCodes?: string
  /** 备注 */
  remark?: string
  /** 化学品列表 */
  chemicals?: StorageOutChemicalItem[]
  /** 任务关联 */
  taskRelations?: { testTaskId: string, testTaskCode: string }[]
  /** 入库ID */
  chemicalId?: string
  /** 出库数量 */
  amount?: number
}
