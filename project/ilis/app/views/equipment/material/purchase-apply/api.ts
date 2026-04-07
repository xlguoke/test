import type { ResponseModel } from '../api'
import type { PurchaseApplyEntity } from './entity/PurchaseApplyEntity'
import { generateGUID } from '~/utils/gen'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取采购申请列表
 */
export function getPurchaseApplyList(params: Record<string, any>): Promise<any> {
  if (params.createDateStart) {
    params.createDateStart = `${params.createDateStart} 00:00:00`
  }
  // 将createDateEnd转换为yyyy-mm-dd 23:59:59
  if (params.createDateEnd) {
    params.createDateEnd = `${params.createDateEnd} 23:59:59`
  }
  return IlisApiHelper.get<ResponseModel<PurchaseApplyEntity>>('ref/purchase/apply', params)
}

export function getWarningMaterialList(params: Record<string, any>): Promise<any> {
  console.warn('getWarningMaterialList', params)
  return new Promise((resolve) => {
    resolve({
      data: {
        rows: [{
          id: generateGUID(),
          name: '氢氧化钠标准溶液', // 标准物质名称
          specification: '0.1mol/L', // 规格型号
          unitPrice: 120.00, // 单价（元）
          unit: '瓶', // 单位
          inventoryQuantity: 100, // 库存
          thresholdValue: 50, // 预警阈值
          custodian: '赵六', // 保管人
        }],
      },
    })
  })
}

/**
 * # 获取采购申请详情
 */
export function getPurchaseApplyDetail(id: string): Promise<any> {
  return IlisApiHelper.get(`ref/purchase/apply/${id}`)
}

/**
 * # 新增采购申请
 */
export function createPurchaseApply(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post('ref/purchase/apply', data)
}

/**
 * # 更新采购申请
 */
export function updatePurchaseApply(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.put(`ref/purchase/apply/${data.id}`, data)
}

/**
 * # 删除采购申请
 */
export function deletePurchaseApply(ids: string): Promise<any> {
  return IlisApiHelper.delete(`ref/purchase/apply/${ids}`)
}

/**
 * # 提交采购申请
 */
export function submitPurchaseApply(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.postForm(`ref/purchase/apply/submit/${data.id}`, data)
}

/**
 * # 撤回采购申请（模拟）
 */
export function revokePurchaseApply(id: string): Promise<any> {
  return IlisApiHelper.post(`ref/purchase/apply/recall/${id}`)
}
