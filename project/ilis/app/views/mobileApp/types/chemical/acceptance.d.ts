/**
 * 化学品验收登记模块类型定义
 * 验收登记是采购登记的一部分，使用采购登记的相关类型
 */

import type {
  Keeper,
  PurchaseDetail,
  PurchaseItem,
  PurchaseListItem,
  PurchaseStatus,
} from './purchase'

// 重新导出采购登记相关类型，便于验收模块使用
export type {
  Keeper,
  PurchaseDetail,
  PurchaseItem,
  PurchaseListItem,
  PurchaseStatus,
}

/** 验收登记列表查询参数 */
export interface AcceptanceListQueryParams {
  /** 每页数量 */
  size?: number
  /** 页码 */
  page?: number
  /** 搜索关键词 */
  q?: string
  /** 登记时间开始 */
  registerTimeStart?: string
  /** 登记时间结束 */
  registerTimeEnd?: string
}

/** 验收登记列表项 - 复用采购登记列表项 */
export type AcceptanceListItem = PurchaseListItem

/** 验收登记详情 - 复用采购登记详情 */
export type AcceptanceDetail = PurchaseDetail

/** 验收明细项 */
export interface AcceptanceItem {
  /** 明细ID */
  id: string
  /** 化学品类别ID */
  chemicalCategoryId: string
  /** 采购登记单ID */
  registerId: string
  /** 采购登记单号 */
  registerCode: string
  /** 化学名称 */
  chemicalName: string
  /** 化学名称编号 */
  chemicalCode: string
  /** 品名 */
  productName: string
  /** 品名编号 */
  productCode: string
  /** 安全类型 */
  safetyType: string
  /** 供应商 */
  supplier: string
  /** 规格 */
  specification: string
  /** 购置数量 */
  purchaseQuantity: number
  /** 生产日期 */
  productionDate: string
  /** 采购日期 */
  purchaseDate: string
  /** 失效日期 */
  invalidDate: string
  /** 纯度 */
  purity: string
  /** 浓度 */
  concentration: string
  /** 保管人列表 */
  keepers: Keeper[]
  /** 验收数量 */
  verifyQuantity: number
  /** 单位 */
  unit: string
  /** 验收情况 */
  verifyQuality: string
  /** 验收其他 */
  verifyExtra: string
  /** 备注 */
  remark: string
}

/** 验收表单 */
export interface AcceptanceForm {
  /** 登记ID */
  id: string
  /** 验收结论 */
  verifyConclusion: string
  /** 验收时间 */
  verifyTime: string
  /** 验收明细列表 */
  items: AcceptanceItemVerify[]
}

/** 验收明细项（提交用） */
export interface AcceptanceItemVerify {
  /** 明细ID */
  id: string
  /** 验收数量 */
  verifyQuantity: number
  /** 验收情况 */
  verifyQuality: string
  /** 验收其他 */
  verifyExtra?: string
}

/** 验收状态 - 复用采购登记状态 */
export type AcceptanceStatus = PurchaseStatus
