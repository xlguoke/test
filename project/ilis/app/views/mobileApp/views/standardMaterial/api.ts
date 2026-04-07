import { request } from '~/views/mobileApp/provides/utils/mRequest'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface StandardMaterialItem {
  id: string
  name: string
  specification?: string
  manufacturer?: string
  productionDate?: string
  validPeriodMonths?: number
  unit?: string
  unitPrice?: number
  standardValue?: string
  inventoryQuantity?: number
  thresholdValue?: number
  custodian?: string
  priorityWeight?: number
  quantity?: number
  lastPurchaseDate?: string
  lastPurchaseQuantity?: number
}

export interface InboundForm {
  materialId: string
  inType: string
  quantity: number
  manufacturer: string
  productionDate: string
  operator: string
  operatorId: string
  stockInDate: string
  attachments?: string
}

export interface OutboundForm {
  materialId: string
  outType: string
  quantity: number
  purpose: string
  operator: string
  operatorId: string
  outDate: string
  attachments?: string
}

export interface PersonOption {
  id: string
  name: string
  account?: string
}

export function getStandardMaterialList(params: {
  page: number
  size: number
  keyword?: string
  productionDateStart?: string
  productionDateEnd?: string
  priorityWeight?: string
}) {
  return request.get<PageResponse<StandardMaterialItem>>(
    '/rest/ref/material',
    { params },
  )
}

export function getStandardMaterialDetail(id: string) {
  return request.get<StandardMaterialItem>(`/rest/ref/material/${id}`)
}

/**
 * 获取标准物质最新一次入库记录
 */
export function getLatestInboundRecord(inType: string, materialId: string): Promise<any> {
  return request.get(`ref/stock/in/material/latest/${inType}/${materialId}`)
}

export function addInbound(data: InboundForm) {
  return request.post<string>(
    '/rest/ref/stock/in',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export function addOutbound(data: OutboundForm) {
  return request.post<string>(
    '/rest/ref/stock/out',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export function getPersonOptions(params?: { keyword?: string, page?: number, size?: number }) {
  return request.get<PageResponse<PersonOption>>(
    '/rest/user/getUserList',
    { params },
  )
}

export function getInboundTypeOptions() {
  return Promise.resolve([
    { label: '购置入库', value: 'PURCHASE' },
    { label: '归还入库', value: 'RETURN' },
    { label: '调拨入库', value: 'TRANSFER' },
  ])
}

export function getOutboundTypeOptions() {
  return Promise.resolve([
    { label: '领用出库', value: 'USE' },
    { label: '调拨出库', value: 'TRANSFER' },
    { label: '失效出库', value: 'EXPIRED' },
  ])
}
