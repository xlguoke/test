import type { AxiosResponse } from 'axios'
import type {
  ChemicalPurchaseRegisterEntity,
} from './ChemicalPurchaseRegisterEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 分页查询采购登记列表
 * GET /chemical/purchase/register/pagination
 * 支持模糊查询化学名称、化学名称编号、规格、供应商、登记人信息
 * 支持按时间区间查询登记时间
 */
export interface GetPurchaseRegisterPageParams {
  page?: number
  size?: number
  q?: string
  registerTimeStart?: string
  registerTimeEnd?: string
}

/**
 * # 采购登记明细项接口
 */
export interface ChemicalPurchaseRegisterItem {
  id?: string
  chemicalCategoryId?: string
  registerId?: string
  registerCode?: string
  chemicalName?: string
  chemicalCode?: string
  productName?: string
  productCode?: string
  specification?: string
  supplier?: string
  purchaseQuantity?: number
  unit?: string
  remark?: string
  purchaseDate?: string
  productionDate?: string
  invalidDate?: string
  purity?: string
  concentration?: string
  keepers?: {
    id: string
    name: string
  }[]
}

/**
 * # 采购登记表单数据接口
 */
export interface ChemicalPurchaseRegisterForm {
  id?: string
  registerCode?: string
  registrant?: string
  registrantId?: string
  registerTime?: string
  verifier?: string
  verifierId?: string
  items: ChemicalPurchaseRegisterItem[]
  attachmentQr?: string
  keepers?: string
  status?: string
}

/**
 * # 分页查询采购登记列表
 */
export function getPurchaseRegisterPage(params: GetPurchaseRegisterPageParams): Promise<AxiosResponse<{
  total: number
  count: number
  rows: ChemicalPurchaseRegisterEntity[]
}>> {
  return IlisApiHelper.get('/chemical/purchase/register/pagination', params)
}

/**
 * # 通过 ID 获取采购登记详情
 * GET /chemical/purchase/register/{id}
 */
export function getPurchaseRegisterDetail(id: string): Promise<AxiosResponse<ChemicalPurchaseRegisterForm>> {
  return IlisApiHelper.get(`/chemical/purchase/register/${id}`)
}

/**
 * # 新增采购登记
 * POST /chemical/purchase/register
 */
export function createPurchaseRegister(data: ChemicalPurchaseRegisterForm) {
  return IlisApiHelper.post('/chemical/purchase/register', data)
}

/**
 * # 更新采购登记
 * PUT /chemical/purchase/register
 */
export function updatePurchaseRegister(data: ChemicalPurchaseRegisterForm) {
  return IlisApiHelper.put('/chemical/purchase/register', data)
}

/**
 * # 删除采购登记
 * DELETE /chemical/purchase/register/{id}
 */
export function deletePurchaseRegister(id: string) {
  return IlisApiHelper.delete(`/chemical/purchase/register/${id}`)
}

/**
 * # 验收
 * PUT /chemical/purchase/register/verify
 */
export function verifyPurchaseRegister(data: {
  id: string
  verifyConclusion: string
  verifyTime: string
  items: {
    id: string
    verifyQuantity: number
    verifyQuality: string
    verifyExtra?: string
  }[]
}) {
  return IlisApiHelper.put('/chemical/purchase/register/verify', data)
}

/**
 * # 提交审核
 * POST /chemical/purchase/register/submit
 */
export interface SubmitData {
  ids: string[]
  presetAuditors?: {
    activitiNodeId: string
    presetUserId: string
    presetUsername: string
    presetUserRealName: string
    processTaskName: string
    department: string
  }[]
  processForm?: {
    key: Record<string, any>
  }
  remark?: string
}

export function submitPurchaseRegister(data: SubmitData) {
  return IlisApiHelper.post('/chemical/purchase/register/submit', data)
}

/**
 * # 撤回化学品采购登记验收申请
 */
export function revokePurchaseRegister(registerId: string, reason?: string) {
  return IlisApiHelper.get('/chemical/purchase/register/revoke', { registerId, reason })
}
