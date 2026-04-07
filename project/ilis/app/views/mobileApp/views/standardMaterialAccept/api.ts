import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export enum EPurchaseAcceptanceStatus {
  Writing = 'WRITING',
  Auditing = 'AUDITING',
  Passed = 'PASSED',
  Rejected = 'REJECTED',
}

export const PurchaseAcceptanceStatusDict = [
  { key: EPurchaseAcceptanceStatus.Writing, label: '填写中', color: '#0066EC' },
  { key: EPurchaseAcceptanceStatus.Auditing, label: '审核中', color: '#F59A23' },
  { key: EPurchaseAcceptanceStatus.Passed, label: '已通过', color: '#4B7902' },
  { key: EPurchaseAcceptanceStatus.Rejected, label: '未通过', color: '#D9001B' },
]

export const PurchaseAcceptanceStatusMap: Record<EPurchaseAcceptanceStatus, { label: string, color: string, describe: string }> = {
  [EPurchaseAcceptanceStatus.Writing]: { label: '填写中', color: '#0066EC', describe: '' },
  [EPurchaseAcceptanceStatus.Auditing]: { label: '审核中', color: '#F59A23', describe: '' },
  [EPurchaseAcceptanceStatus.Passed]: { label: '已通过', color: '#4B7902', describe: '' },
  [EPurchaseAcceptanceStatus.Rejected]: { label: '未通过', color: '#D9001B', describe: '[审核人员]审核不通过：XXXXXXXXXXXXXXXXXXXX' },
}

export interface PurchaseAcceptanceItem {
  id: string
  acceptDate?: string
  purchaseDate?: string
  accepterId?: string
  accepter?: string
  itemCount?: number
  totalAmount?: number
  conclusion?: string
  status?: EPurchaseAcceptanceStatus
  createBy?: string
  createDate?: string
}

export interface PurchaseAcceptanceListParams {
  page: number
  size: number
  keyword?: string
  acceptDateStart?: string
  acceptDateEnd?: string
  purchaseDateStart?: string
  purchaseDateEnd?: string
  status?: EPurchaseAcceptanceStatus
}

export function getPurchaseAcceptanceList(params: PurchaseAcceptanceListParams) {
  const processedParams: Record<string, any> = { ...params }
  return mRequest.get('/rest/ref/purchase/accept', { params: processedParams })
}

export function getPurchaseAcceptanceDetail(id: string) {
  return mRequest.get(`/rest/ref/purchase/accept/${id}`)
}

export function createPurchaseAcceptance(data: Record<string, any>): Promise<any> {
  return mRequest.post('/rest/ref/purchase/accept', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function updatePurchaseAcceptance(data: Record<string, any>): Promise<any> {
  return mRequest.put(`/rest/ref/purchase/accept/${data.id}`, data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function deletePurchaseAcceptance(ids: string) {
  return mRequest.delete(`/rest/ref/purchase/accept/${ids}`)
}

export function submitPurchaseAcceptance(data: Record<string, any>): Promise<any> {
  return mRequest.postForm(`/rest/ref/purchase/accept/submit/${data.id}`, data)
}

export function revokePurchaseAcceptance(id: string) {
  return mRequest.post(`/rest/ref/purchase/accept/recall/${id}`)
}

export function getStatusLabel(status?: EPurchaseAcceptanceStatus): string {
  if (!status)
    return ''
  return PurchaseAcceptanceStatusMap[status]?.label || ''
}

export function getStatusColor(status?: EPurchaseAcceptanceStatus): string {
  if (!status)
    return ''
  return PurchaseAcceptanceStatusMap[status]?.color || ''
}

export function getVanTagType(status?: EPurchaseAcceptanceStatus): 'primary' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case EPurchaseAcceptanceStatus.Writing:
      return 'primary'
    case EPurchaseAcceptanceStatus.Auditing:
      return 'warning'
    case EPurchaseAcceptanceStatus.Passed:
      return 'success'
    case EPurchaseAcceptanceStatus.Rejected:
      return 'danger'
    default:
      return 'primary'
  }
}

export function getMaterialNameList(keyword?: string) {
  return mRequest.get('/rest/ref/material/names', { params: { keyword } })
}

export function getMaterialListByName(materialName: string) {
  return mRequest.get('/rest/ref/material/list/by/name', { params: { materialName } })
}

export function getUnitDict() {
  return mRequest.get('/rest/type/getTypesByGroupCode', { params: { groupCode: 'sampleAmountUnit' } })
}

export function getCustodians(keyword?: string) {
  return mRequest.get('/rest/ref/material/custodians', { params: { keyword } })
}

export function createAcceptanceRecord(data: Record<string, any>) {
  return mRequest.post(`/rest/ref/purchase/accept/register/${data.id}`, data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getNoPassReason(businessKey: string): Promise<any> {
  return mRequest.get(`/rest/auditProcess/${businessKey}/no-pass-reason`)
}

// ===================== 采购申请相关接口 =====================

export function getPurchaseApplyList(params: Record<string, any>) {
  return mRequest.get('/rest/ref/purchase/apply', { params })
}

export function getPurchaseApplyDetail(id: string) {
  return mRequest.get(`/rest/ref/purchase/apply/${id}`)
}

export function getStandardMaterialLedgerDetail(id: string) {
  return mRequest.get(`/rest/ref/material/${id}`)
}
