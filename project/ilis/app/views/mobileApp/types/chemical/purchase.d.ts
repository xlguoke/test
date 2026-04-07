/**
 * 化学品采购登记模块类型定义
 */

/** 保管人 */
export interface Keeper {
  /** 用户ID */
  id: string
  /** 用户名称 */
  name: string
}

/** 采购登记列表查询参数 */
export interface PurchaseListQueryParams {
  /** 每页数量 */
  size?: number
  /** 页码 */
  page?: number
  /** 搜索关键词 */
  q?: string
  /** 验收状态 */
  status?: PurchaseStatus
  /** 登记时间开始 */
  registerTimeStart?: string
  /** 登记时间结束 */
  registerTimeEnd?: string
  /** 排序字段 */
  sort?: string
  /** 排序方式 */
  order?: 'asc' | 'desc'
}

/** 采购登记列表项 */
export interface PurchaseListItem {
  /** 登记ID */
  id: string
  /** 采购登记单号 */
  registerCode: string
  /** 采购登记人ID */
  registrantId: string
  /** 采购登记人名称 */
  registrant: string
  /** 采购登记时间 */
  registerTime: string
  /** 验收人ID */
  verifierId: string
  /** 验收人名称 */
  verifier: string
  /** 验收结论 */
  verifyConclusion: string
  /** 验收时间 */
  verifyTime: string | null
  /** 状态 */
  status: PurchaseStatus
}

/** 采购登记状态 */
export type PurchaseStatus
  = | 'IN_FILLING' // 填写中
    | 'PENDING_SUBMIT' // 待提交
    | 'UNDER_REVIEW' // 审核中
    | 'NOT_APPROVED' // 未通过
    | 'COMPLETED' // 已完成

/** 采购登记明细项 */
export interface PurchaseItem {
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

/** 采购登记详情 */
export interface PurchaseDetail {
  /** 登记ID */
  id: string
  /** 采购登记单号 */
  registerCode: string
  /** 采购登记人ID */
  registrantId: string
  /** 采购登记人名称 */
  registrant: string
  /** 采购登记时间 */
  registerTime: string
  /** 验收人ID */
  verifierId: string
  /** 验收人名称 */
  verifier: string
  /** 保管人名称（逗号分隔） */
  keepers?: string
  /** 验收结论 */
  verifyConclusion: string
  /** 验收时间 */
  verifyTime: string
  /** 状态 */
  status: PurchaseStatus
  /** 化学品明细列表 */
  items: PurchaseItem[]
  /** 附件二维码 */
  attachmentQr?: string
}

/** 采购登记明细项（新增/更新共用） */
export interface PurchaseItemForm {
  /** 明细ID */
  id?: string
  /** 化学品类别ID */
  chemicalCategoryId: string
  /** 采购登记单ID */
  registerId?: string
  /** 采购登记单号 */
  registerCode?: string
  /** 化学名称 */
  chemicalName: string
  /** 化学名称编号 */
  chemicalCode: string
  /** 品名 */
  productName: string
  /** 品名编号 */
  productCode: string
  /** 安全类型 */
  safetyType?: string
  /** 供应商 */
  supplier: string
  /** 规格 */
  specification: string
  /** 购置数量 */
  purchaseQuantity: number
  /** 购置日期 */
  purchaseDate: string
  /** 生产日期 */
  productionDate: string
  /** 失效日期 */
  invalidDate: string
  /** 纯度 */
  purity?: string
  /** 浓度 */
  concentration?: string
  /** 保管人列表 */
  keepers?: Keeper[]
  /** 单位 */
  unit?: string
  /** 验收数量 */
  verifyQuantity?: number
  /** 验收情况 */
  verifyQuality?: string
  /** 验收其他 */
  verifyExtra?: string
  /** 备注 */
  remark?: string
  /** 是否选中（前端使用） */
  selected?: boolean
}

/** 采购登记表单（新增/更新共用） */
export interface PurchaseForm {
  /** 登记ID（编辑时传入） */
  id?: string
  /** 采购登记单号 */
  registerCode?: string
  /** 采购登记人ID */
  registrantId?: string
  /** 采购登记人名称 */
  registrant?: string
  /** 采购登记时间 */
  registerTime?: string
  /** 验收人ID */
  verifierId?: string
  /** 验收人名称 */
  verifier?: string
  /** 保管人ID（逗号分隔） */
  keeperIds?: string
  /** 保管人名称（逗号分隔） */
  keepers?: string
  /** 验收结论 */
  verifyConclusion?: string
  /** 验收时间 */
  verifyTime?: string
  /** 状态 */
  status?: PurchaseStatus
  /** 化学品明细列表 */
  items: PurchaseItemForm[]
  /** 附件二维码 */
  attachmentQr?: string
}

/** 验收明细项 */
export interface PurchaseItemVerify {
  /** 明细ID */
  id: string
  /** 验收数量 */
  verifyQuantity: number
  /** 验收情况 */
  verifyQuality: string
  /** 验收其他 */
  verifyExtra?: string
}

/** 验收表单 */
export interface PurchaseVerifyForm {
  /** 登记ID */
  id: string
  /** 验收结论 */
  verifyConclusion: string
  /** 验收时间 */
  verifyTime: string
  /** 验收明细列表 */
  items: PurchaseItemVerify[]
}

/** 预设审核员 */
export interface PresetAuditor {
  /** 流程节点ID */
  activitiNodeId: string
  /** 预设人员ID */
  presetUserId: string
  /** 预设人员登录名 */
  presetUsername: string
  /** 预设人员真实姓名 */
  presetUserRealName: string
  /** 流程任务名称 */
  processTaskName: string
  /** 部门 */
  department: string
}

/** 提交审核表单 */
export interface PurchaseSubmitForm {
  /** 登记ID列表 */
  ids: string[]
  /** 预设审核员列表 */
  presetAuditors?: PresetAuditor[]
  /** 流程表单数据 */
  processForm?: Record<string, any>
  /** 备注 */
  remark?: string
}

/** 撤回申请参数 */
export interface PurchaseRevokeParams {
  /** 采购登记验收信息表ID */
  registerId: string
  /** 原因 */
  reason?: string
}
