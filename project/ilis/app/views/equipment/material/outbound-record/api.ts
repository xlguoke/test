import type { ResponseModel } from '../api'
import type { OutboundRecordEntity } from './entity/OutboundRecordEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 获取出库记录列表
 */
export function getOutboundRecordList(params: Record<string, any>): Promise<any> {
  if (params.outDateStart) {
    params.outDateStart = `${params.outDateStart} 00:00:00`
  }
  if (params.outDateEnd) {
    params.outDateEnd = `${params.outDateEnd} 23:59:59`
  }
  return IlisApiHelper.get<ResponseModel<OutboundRecordEntity>>('ref/stock/out', params)
}

/**
 * 获取出库记录详情
 */
export function getOutboundRecordDetail(id: string): Promise<any> {
  return IlisApiHelper.get(`ref/stock/out/${id}`)
}

/**
 * 新增出库记录
 */
export function createOutboundRecord(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post('ref/stock/out', data)
}

/**
 * 更新出库记录
 */
export function updateOutboundRecord(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.put(`ref/stock/out/${data.id}`, data)
}

/**
 * 返还入库
 */
export function returnInbound(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post(`ref/stock/out/${data.stockOutId}/return`, data)
}

/**
 * 删除出库记录
 */
export function deleteOutboundRecord(ids: string): Promise<any> {
  return IlisApiHelper.delete(`ref/stock/out/${ids}`)
}

/**
 * 导出出库记录
 */
export function exportOutboundRecord(params: Record<string, any>): Promise<any> {
  console.warn('exportOutboundRecord', params)
  return new Promise((resolve) => {
    resolve({
      data: {},
    })
  })
}
