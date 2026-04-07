/**
 * 实时库存模块类型定义
 */

/**
 * 库存列表项
 * 与后端 /rest/chemical/inventory/paginationByCategory 接口返回一致
 */
export interface InventoryItem {
  /** ID */
  id: string
  /** 化学名称 */
  name: string
  /** 化学名称编号 */
  sn: string
  /** 所属类别 */
  chemicalType: string
  /** 管理级别 */
  manageLevel: string
  /** 用途 */
  effect: string
  /** 纯度 */
  purity: string
  /** 浓度 */
  concentration: string
  /** 计量单位 */
  unit: string
  /** 可支配库存 */
  amount: number
  /** 预警数量 */
  warningAmount: number
  /** 最近一次更新时间 */
  lastUpdateTime: string
}

/**
 * 库存列表查询参数
 */
export interface InventoryQueryParams {
  /** 页码 */
  page: number
  /** 每页条数 */
  size: number
  /** 快速查询（化学名称、化学名称编号） */
  quickQry?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方式 */
  order?: 'asc' | 'desc'
}

/**
 * 日志项
 * 与后端 /rest/synthesis/log 接口返回一致
 */
export interface LogItem {
  /** ID */
  id: string
  /** 内容 */
  content: string
  /** 处理意见 */
  opinion: string
  /** 对象编号 */
  objectSn: string
  /** 处理人 */
  createName: string
  /** 时间 */
  createDate: string
}

/**
 * 日志查询参数
 */
export interface LogQueryParams {
  /** 对象ID */
  id: string
  /** 对象类型（11-化学品库存） */
  objectType: string
  /** 是否查询关联对象 */
  relationQry?: boolean
}
