/**
 * 化学品存量模块类型定义
 */

/**
 * 化学品存量列表项
 * 与后端 /rest/chemical/inventory/pagination 接口返回一致
 */
export interface ChemicalStockItem {
  /** ID */
  id: string
  /** 化学品编号 */
  sn: string
  /** 品名 */
  name: string
  /** 化学名称 */
  categoryName: string
  /** 管理级别 */
  manageLevel: string
  /** 计量单位 */
  unit: string
  /** 纯度 */
  purity: string
  /** 浓度 */
  concentration: string
  /** 规格型号 */
  specification: string
  /** 用途 */
  effect: string
  /** 化学品来源 */
  sourceFrom: string
  /** 生产（配置）日期 */
  productionDate: string
  /** 失效日期 */
  invalidDate: string
  /** 可用余量 */
  amount: number
  /** 保管人 */
  keepers: string
}

/**
 * 化学品存量列表查询参数
 */
export interface ChemicalStockQueryParams {
  /** 页码 */
  page: number
  /** 每页条数 */
  size: number
  /** 快速查询（化学名称、化学品编号） */
  quickQry?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方式 */
  order?: 'asc' | 'desc'
}

/**
 * 出入库记录项
 * 与后端 /rest/chemical/inventory/{id} 接口返回一致
 * 注意：此类型在 use-registration.d.ts 中已定义，请从那里导入
 */
export type { StorageRecordItem } from './use-registration'
