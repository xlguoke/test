/**
 * 化学品选择模块类型定义
 */

/** 化学品列表查询参数 */
export interface ChemicalListQueryParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 搜索关键词 - 化学名称/化学名称编号 */
  quickQry?: string
}

/** 化学品列表项 */
export interface ChemicalListItem {
  /** 化学品ID */
  id: string
  /** 化学名称 */
  name: string
  /** 化学名称编号 */
  sn: string
  /** 化学品分类 */
  safetyType?: string
  /** 管理级别 */
  manageLevel?: string
  /** 管理级别ID */
  manageLevelId?: string
  /** 用途 */
  effect?: string
  /** 纯度 */
  purity?: string
  /** 浓度 */
  concentration?: string
  /** 规格型号 */
  specification?: string
  /** 计量单位 */
  unit?: string
  /** 备注 */
  remark?: string
  /** 包装方式 */
  packing?: string
}

/** 化学品列表响应 */
export interface ChemicalListResponse {
  /** 总数量 */
  count: number
  /** 数据列表 */
  rows: ChemicalListItem[]
}

/**
 * 溶液选择模块类型定义
 */

/** 溶液列表项 */
export interface SolutionItem {
  /** 溶液ID */
  id: string
  /** 溶液编号 */
  sn: string
  /** 溶液名称 */
  name: string
  /** 状态 */
  status: string
  /** 分类名称 */
  categoryName: string
  /** 浓度 */
  concentration: string
  /** 配制量 */
  confectAmount: number
  /** 配制依据 */
  confectAccordance: string
  /** 配制介质 */
  confectMedium: string
}

/** 溶液列表查询参数 */
export interface SolutionListQueryParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  size: number
  /** 搜索关键词 */
  quickQry?: string
  /** 状态 */
  status?: string
}

/** 溶液列表响应 */
export interface SolutionListResponse {
  /** 总数量 */
  count: number
  /** 数据列表 */
  rows: SolutionItem[]
}
