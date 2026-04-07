import type { ConsignListEntity } from './ConsignListEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 列表查询参数 */
export interface ListQueryParams {
  page: number
  size: number
  q?: string
}

/** 分页列表 */
export function pageListApi(params: ListQueryParams) {
  return IlisApiHelper.get<IPageModel<ConsignListEntity>>(`rest/consign/list`, params)
}

/** 资质类型 */
export interface Qualification {
  id: string
  name: string
  code: string
  certificateNo: string
  defaultFlag?: boolean
}
export function qualificationsApi() {
  return IlisApiHelper.get<Qualification[]>(`rest/common-body/qualification/list`)
}

/** 检测类别 */
export interface CheckType {
  id: string
  name: string
}
/** 检测类别 */
export function checkTypeApi() {
  return IlisApiHelper.get<CheckType[]>(`checkTypeController.do?getAll`)
}

/** 编号类别 */
export interface SnTypegory {
  id: string
  name: string
  type: string
}
/** 编号类别 */
export function snTypeApi() {
  return IlisApiHelper.post<{ obj: SnTypegory[] }>(`tSnCategoryController.do?getAllSnCategory`)
}

/** 获取样品列表 */
export function sampleListApi(params: { consignId: string }) {
  return IlisApiHelper.get<any>(`rest/consign/object`, params)
}

/** 检查参数不同 */
export interface ParamDiffer {
  generateProcessObjectPresent: number
  buildSampleCodePresent: number
  buildLocaleItemCodePresent: number
  objectCode: string
  testObjectId: string
  consignId: string
  buildSampleCode: number
  objectName: string
  buildLocaleItemCode: number
  consignCode: string
  generateProcessObject: number
}
export function checkParamDiffApi(params: { consignIds: string }) {
  return IlisApiHelper.get<ParamDiffer[]>(`rest/consign/object/param-differs`, params)
}

/** 同步试验参数 */
export function syncTestParamSettingsApi(data: { consignIds: string, policies: any[] }) {
  return IlisApiHelper.post<any>(`rest/consign/object/param-setting`, data)
}

/** 检查编号规则 */
export function checkSnRuleApi(data: { consignId: string, consignCode: string }) {
  return IlisApiHelper.get<any>(`consignController.do?isExpectedConsignCode`, data)
}

/** 创建委托编号 */
export function createConsignNoApi(data: { consignId: string }) {
  return IlisApiHelper.get<any>(`consignController.do?useSnImmediately`, data)
}

/** 验证权限 */
export function checkPermissionApi(consignId: string) {
  return IlisApiHelper.get<any>(`consignController.do?doPermissionCheck`, { id: consignId })
}

/** 复制委托 */
export interface BatchCopyConsign {
  /** 委托id，多个半角逗号分隔 */
  ids: string
  /** 复制份数 */
  copyAmount: number
  /** 复制字段，逗号拼接 */
  checkedFields?: string
  /** 如果复制委托样品下有外来样品，需要选择复制外来样品的模式 true-引用 false-新建 */
  referred?: boolean
}
/** 复制委托 */
export function batchCopyConsignApi(data: BatchCopyConsign) {
  return ilisAxios.post<any>(`consignController.do?doBatchCopy`, data)
}
/** 复制委托：获取需要复制的字段 */
export interface CopyFields {
  name: string
  describe: string
  orderNum: number
  custom: boolean
}
/** 复制委托：获取需要复制的字段 */
export function copyFieldsApi(consignIds: string) {
  return IlisApiHelper.get<{ obj: CopyFields[], attributes: any }>(`rest/consignController?getConsignFields`, { ids: consignIds })
}
/** 复制委托：获取自定义布局中的字段信息：返回必填项 */
export interface CopyLayoutFields {
  key: string
  layout: any[]
  tab: string
}
/** 复制委托：获取自定义布局中的字段信息 */
export function copyLayoutFieldsApi() {
  return IlisApiHelper.get<CopyLayoutFields[]>(`systemController/getConsignInfoLayoutTemplate.do`)
}

/** 恢复委托 */
export function recoverConsignApi(data: { ids: string, comment: string }) {
  return IlisApiHelper.postForm<any>(`consignController.do?recoveryConsign`, data)
}

/** 作废委托 */
export function batchCancelledApi(data: { ids: string, comment: string, releaseSn?: boolean }) {
  return IlisApiHelper.postForm<any>(`consignController.do?batchDelete`, data)
}

/** 撤回委托 */
export function withdrawConsignApi(data: { ids: string, reason: string }) {
  return IlisApiHelper.get<any>(`consignController.do?revocationConsign`, data)
}

/** 删除委托 */
export function deleteConsignApi(data: { ids: string }) {
  return IlisApiHelper.get<any>(`consignController/deleteConsign.do`, data)
}

/** 删除委托前确认 */
interface DeleteConsignConfirm {
  backConsigns?: string[]
  presetConsigns?: string[]
  subcontracts?: boolean
  tasks?: string[]
  reports?: string[]
  danger: boolean
}
export function deleteConsignConfirmApi(data: { ids: string }) {
  return IlisApiHelper.get<DeleteConsignConfirm>(`consignController/deleteConsignConfirm.do`, data)
}

/** 变更合同 */
export function changeContractApi(data: { contractId: string, consignInfoIds: string[] }) {
  return IlisApiHelper.post<any>(`rest/consignController/appoint/contract`, data)
}

/** 获取签名信息 */
export interface SignatureInfo {
  id: string
  consignId: string
  consignUnitId: string
  consignProjectId: string
  signUser: string
  signPhone: string
  signUrl: string
  signType: string
}
/** 获取签名信息 */
export function getSignatureApi(consignId: string) {
  return IlisApiHelper.post<SignatureInfo[]>(`consignController/getSignature.do?consignId=${consignId}`)
}

/** 获取委托样品信息设置标签数量 */
export interface ConsignSampleData {
  id: string
  processObjectId: string
  sampleProcessMethod: string
  consignId: string
  testObjectName: string
  consignCode: string
  testObjectCode: string
  status: string
  operation: number
}

/** 获取委托样品信息设置标签数量 */
export function getSampleByConsignApi(params: { consignIds: string }) {
  return IlisApiHelper.get<ConsignSampleData[]>(`testObjectController.do?getProcessObjectByConsign`, params)
}

/** 修改备注 */
export function updateRemarkApi(data: { id: string, remark: string }) {
  return IlisApiHelper.post<any>(`rest/consignController/saveRemark`, data)
}

/** 打印 */
export function printConfigApi() {
  return IlisApiHelper.get<any>(`rest/consign/print/config`)
}

/** 委托样品列表-设置检测部门 */
export interface TestDepartmentData {
  sampleName: string
  standard: string
  provideToCustomerSampleCode?: string
  departmentId: string
  testParams: string
  consignCode: string
  id: string
  department: string
  testObjectCode: string
  status: string
}
/** 委托样品列表-设置检测部门 */
export function objectDestributeApi(params: { consignIds: string }) {
  return IlisApiHelper.get<TestDepartmentData[]>(`rest/consign/object-distribute`, params)
}
/** 修改检测部门：不传部门信息时为删除 */
export function updateObjectDestributeApi(data: { objectId: string, department?: string, departmentId?: string }[]) {
  return IlisApiHelper.post<any>(`rest/object/distributions`, data)
}
