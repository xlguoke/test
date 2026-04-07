/**
 * 使用登记模块类型定义
 */

/**
 * 使用登记列表项
 * 与后端 /rest/chemical/inventoryOutRecord/pagination 接口返回一致
 */
export interface UseRegistrationItem {
  /** ID */
  id: string
  /** 化学品ID */
  chemicalId: string
  /** 状态 */
  status: string
  /** 出库批号 */
  batchSn: string
  /** 出库类型 */
  type: string
  /** 化学品编号 */
  sn: string
  /** 品名 */
  name: string
  /** 化学名称 */
  chemicalName: string
  /** 用途 */
  effect: string
  /** 纯度 */
  purity: string
  /** 浓度 */
  concentration: string
  /** 生产日期 */
  productionDate: string
  /** 失效日期 */
  invalidDate: string
  /** 失效天数（负数表示已过期） */
  invalid: number
  /** 领用人 */
  receivers: string
  /** 出库量 */
  amount: number
  /** 本次出库可用余量 */
  remainingAmount: number
  /** 关联检测任务 */
  testTaskCodes: string
}

/**
 * 使用登记列表查询参数
 */
export interface UseRegistrationQueryParams {
  /** 页码 */
  page: number
  /** 每页条数 */
  size: number
  /** 快速查询 */
  quickQry?: string
  /** 排序字段 */
  orderBy?: string
  /** 排序方式 */
  order?: 'asc' | 'desc'
}

/**
 * 任务项（用于选择器回显）
 */
export interface TaskItem {
  /** 任务ID */
  id: string
  /** 任务编号 */
  testTaskCode: string
}

/**
 * 溶液项（用于选择器回显）
 */
export interface SolutionFormItem {
  /** 溶液ID */
  id: string
  /** 溶液编号 */
  sn: string
  /** 溶液名称 */
  name: string
}

/**
 * 使用登记新增/编辑表单数据
 * 与后端API保存格式一致
 */
export interface UseRegistrationForm {
  /** ID */
  id?: string
  /** 当次使用量 */
  amount: number | undefined
  /** 关联任务IDs（逗号分隔） */
  testTaskIds?: string
  /** 关联任务编号（逗号分隔） */
  testTaskCodes?: string
  /** 溶液IDs（逗号分隔） */
  solutionIds?: string
  /** 溶液编号（逗号分隔） */
  solutionSns?: string
  /** 溶液名称（逗号分隔） */
  solutionNames?: string
  /** 备注 */
  remark?: string
  /** 出库记录ID */
  chemicalInventoryOutId?: string
}

/**
 * 使用记录项
 */
export interface UseRecordItem {
  /** ID */
  id: string
  /** 类型 */
  type: string
  /** 当次使用量 */
  amount: number
  /** 关联任务 */
  testTaskCodes: string
  /** 溶液名称 */
  solutionNames: string
  /** 备注 */
  remark: string
  /** 操作人 */
  operationPerson: string
  /** 操作时间 */
  operationTime: string
}

/**
 * 使用记录详情
 */
export interface UseRecordDetail {
  /** 化学品名称 */
  chemicalName: string
  /** 出库数量 */
  outAmount: number
  /** 返还数量 */
  returnAmount: number
  /** 计量单位 */
  chemicalUnit: string
}

/**
 * 使用记录响应数据
 */
export interface UseRecordResponse {
  /** 消耗详情 */
  consumeDetail: UseRecordDetail
  /** 使用记录列表 */
  inventoryOutRecordVOs: UseRecordItem[]
}

/**
 * 出入库记录项
 */
export interface StorageRecordItem {
  /** ID */
  id: string
  /** 化学品编号 */
  sn: string
  /** 品名 */
  name: string
  /** 关联任务 */
  testTaskCodes: string
  /** 检测参数 */
  testParams: string
  /** 出入库类型 */
  type: string
  /** 出入库方向 */
  inOrOut: string
  /** 出入库批号 */
  batchSn: string
  /** 变动时间 */
  completeOperationDate: string
  /** 出库数量 */
  outAmount: number
  /** 入库数量 */
  inAmount: number
  /** 当次可用余量 */
  afterAmount: number
  /** 备注 */
  remark: string
}

/**
 * 使用登记详情
 */
export interface UseRegistrationDetail extends UseRegistrationItem {
  /** 使用记录列表 */
  useRecords?: UseRecordItem[]
  /** 出入库记录列表 */
  storageRecords?: StorageRecordItem[]
}

/**
 * 关联任务项
 */
export interface RelatedTaskItem {
  /** ID */
  id: string
  /** 任务编号 */
  code: string
  /** 任务名称 */
  name: string
}
