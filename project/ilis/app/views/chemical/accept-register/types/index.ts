import {
  EPurchaseApplyStatus,
  purchaseApplyStatusDict,
} from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'

export { EPurchaseApplyStatus, purchaseApplyStatusDict }

/** 保管人 */
export interface Keeper {
  /** 人员ID */
  id: string
  /** 人员姓名 */
  name: string
}

/** 采购登记列表项（分页 rows） */
export interface AcceptRegisterListItem {
  id?: string
  registerCode?: string
  registrantId?: string
  registrant?: string
  registerTime?: string
  verifierId?: string
  verifier?: string
  verifyConclusion?: string
  verifyTime?: string | null
  status?: EPurchaseApplyStatus
}

/** 采购登记明细项（详情 items 数组元素） */
export interface AcceptRegisterItem {
  id?: string
  chemicalCategoryId?: string
  registerId?: string
  registerCode?: string
  chemicalName?: string
  chemicalCode?: string
  productName?: string
  productCode?: string
  safetyType?: string
  supplier?: string
  specification?: string
  purchaseQuantity?: number
  productionDate?: string
  purchaseDate?: string
  invalidDate?: string
  purity?: string
  concentration?: string
  keepers?: Keeper[]
  verifyQuantity?: number | null
  unit?: string
  verifyQuality?: string | null
  verifyExtra?: string | null
  remark?: string
}

/** 采购登记详情 */
export interface AcceptRegisterDetail {
  id: string
  registerCode?: string
  registrantId?: string
  registrant?: string
  registerTime?: string
  verifierId?: string
  verifier?: string
  verifyConclusion?: string
  verifyTime?: string
  status?: EPurchaseApplyStatus
  items: AcceptRegisterItem[]
  attachmentQr?: string
}

/** 采购登记表单模型（前端使用：新增/编辑/验收复用） */
export interface AcceptRegisterFormModel {
  id?: string
  registerCode?: string
  registrant?: string
  registrantId?: string
  registerTime?: string
  verifier?: string
  verifierId?: string
  attachmentQr?: string
  /** 验收结论（验收模式使用） */
  verifyConclusion?: string
  /** 验收时间（验收模式使用） */
  verifyTime?: string
  /** 保管人姓名（前端表单显示用） */
  status?: EPurchaseApplyStatus
  keepers?: string
  items: AcceptRegisterItem[]
}

/** 创建采购登记请求体（按文档明确字段） */
export interface CreateAcceptRegisterRequest {
  registrantId?: string
  registrant?: string
  registerTime?: string
  verifierId: string
  verifier: string
  verifyConclusion?: string
  verifyTime?: string
  items: AcceptRegisterItemOnCreate[]
  attachmentQr: string
}

/** 创建时明细项（按文档明确字段） */
export interface AcceptRegisterItemOnCreate {
  id?: string
  chemicalCategoryId: string
  chemicalName: string
  chemicalCode: string
  productName: string
  productCode: string
  safetyType?: string
  supplier: string
  specification: string
  purchaseQuantity: number
  productionDate?: string
  purchaseDate?: string
  invalidDate?: string
  purity?: string
  concentration?: string
  keepers?: Keeper[]
  verifyQuantity?: number
  unit: string
  verifyQuality?: string
  verifyExtra?: string
  remark?: string
}

/** 更新采购登记请求体（按文档明确字段） */
export interface UpdateAcceptRegisterRequest {
  id: string
  registerCode?: string
  registrantId?: string
  registrant?: string
  registerTime?: string
  verifierId: string
  verifier: string
  verifyConclusion?: string
  verifyTime?: string | null
  status?: EPurchaseApplyStatus
  items?: AcceptRegisterItemOnUpdate[]
  attachmentQr?: string
}

/** 更新时明细项（按文档明确字段） */
export interface AcceptRegisterItemOnUpdate {
  id?: string
  chemicalCategoryId?: string
  registerId?: string
  registerCode?: string
  chemicalName: string
  chemicalCode: string
  productName: string
  productCode: string
  safetyType?: string
  supplier: string
  specification: string
  purchaseQuantity: number
  productionDate?: string
  purchaseDate?: string
  invalidDate?: string
  purity?: string
  concentration?: string
  keepers?: Keeper[]
  verifyQuantity?: number
  unit: string
  verifyQuality?: string
  verifyExtra?: string
  remark?: string
}

/** 验收采购登记请求体：仅包含验收相关字段 */
export interface VerifyAcceptRegisterRequest {
  id: string
  verifyConclusion: string
  verifyTime: string
  items?: AcceptRegisterItemOnVerify[]
}

/** 验收时明细项：只传递验收需要的字段 */
export interface AcceptRegisterItemOnVerify {
  id: string
  verifyQuantity: number
  verifyQuality: string
  verifyExtra?: string
}

/** 提交审核请求体 */
export interface SubmitAcceptRegisterRequest {
  ids?: string[]
  presetAuditors?: PresetAuditor[]
  processForm?: ProcessFormData
  remark?: string
}

/** 预设审核员 */
export interface PresetAuditor {
  activitiNodeId?: string
  presetUserId?: string
  presetUsername?: string
  presetUserRealName?: string
  processTaskName?: string
  department?: string
}

/** 流程表单数据 */
export interface ProcessFormData {
  key: Record<string, unknown>
}

/** 撤回采购登记参数 */
export interface RevokeAcceptRegisterParams {
  registerId?: string
  reason?: string
}

/** 分页查询参数 */
export interface AcceptRegisterPageParams {
  page?: number
  size?: number
  q?: string
  registerTimeStart?: string
  registerTimeEnd?: string
}

/** 分页查询结果 */
export interface AcceptRegisterPageResult {
  total: number
  count: number
  rows: AcceptRegisterListItem[]
}
