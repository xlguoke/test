import type { ResponseModel } from '../api'
import type { PurchaseAcceptanceEntity } from './entity/PurchaseAcceptanceEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 获取购置验收登记列表
 */
export function getPurchaseAcceptanceList(params: Record<string, any>): Promise<any> {
  if (params.acceptDateStart) {
    params.acceptDateStart = `${params.acceptDateStart} 00:00:00`
  }
  if (params.acceptDateEnd) {
    params.acceptDateEnd = `${params.acceptDateEnd} 23:59:59`
  }
  if (params.purchaseDateStart) {
    params.purchaseDateStart = `${params.purchaseDateStart} 00:00:00`
  }
  if (params.purchaseDateEnd) {
    params.purchaseDateEnd = `${params.purchaseDateEnd} 23:59:59`
  }
  return IlisApiHelper.get<ResponseModel<PurchaseAcceptanceEntity>>('ref/purchase/accept', params)
}
// 获取当前登录用户信息
export function getCurrentUser(): Promise<any> {
  return IlisApiHelper.get('userController.do?getCurrentUser')
}

/**
 * 获取验收单详情 (含明细及验收结论)
 */
export function getPurchaseAcceptanceDetail(id: string): Promise<any> {
  return IlisApiHelper.get(`ref/purchase/accept/${id}`)
}

/**
 * 创建购置登记
 */
export function createPurchaseAcceptance(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post('ref/purchase/accept', data)
}

/**
 * 更新购置登记
 */
export function updatePurchaseAcceptance(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.put(`ref/purchase/accept/${data.id}`, data)
}

/**
 * 创建验收登记
 */
export function createAcceptanceRecord(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post(`ref/purchase/accept/register/${data.id}`, data)
}

/**
 * 批量删除验收记录
 */
export function deletePurchaseAcceptance(ids: string): Promise<any> {
  return IlisApiHelper.delete(`ref/purchase/accept/${ids}`)
}

// 获取验收单详情 (含明细及验收结论)
export function getAcceptanceDetail(id: string): Promise<any> {
  return IlisApiHelper.get(`ref/purchase/accept/${id}`)
}

// 提交验收申请
export function submitPurchaseAcceptance(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.postForm(`ref/purchase/accept/submit/${data.id}`, data)
}

// 撤回
export function revokePurchaseAcceptance(id: string): Promise<any> {
  return IlisApiHelper.post(`ref/purchase/accept/recall/${id}`)
}
