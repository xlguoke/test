import type { ResponseModel } from '../api'
import type { InboundRecordEntity } from './entity/InboundRecordEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 获取入库记录列表
 */
export function getInboundRecordList(params: Record<string, any>): Promise<any> {
  if (params.stockInDateStart) {
    params.stockInDateStart = `${params.stockInDateStart} 00:00:00`
  }
  if (params.stockInDateEnd) {
    params.stockInDateEnd = `${params.stockInDateEnd} 23:59:59`
  }
  return IlisApiHelper.get<ResponseModel<InboundRecordEntity>>('ref/stock/in', params)
}

/**
 * 获取入库记录详情
 */
export function getInboundRecordDetail(id: string): Promise<any> {
  return IlisApiHelper.get(`ref/stock/in/${id}`)
}

/**
 * 新增入库记录
 */
export function createInboundRecord(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post('ref/stock/in', data)
}

/**
 * 更新入库记录
 */
export function updateInboundRecord(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.put(`ref/stock/in/${data.id}`, data)
}

/**
 * 删除入库记录
 */
export function deleteInboundRecord(ids: string): Promise<any> {
  return IlisApiHelper.delete(`ref/stock/in/${ids}`)
}

/**
 * 导出入库记录
 */
export function exportInboundRecord(params: Record<string, any>): Promise<any> {
  console.warn('exportInboundRecord', params)
  return new Promise((resolve) => {
    resolve({
      data: {},
    })
  })
}

/**
 * 下载导入模板
 */
export function downloadImportTemplate(): void {
  console.warn('downloadImportTemplate')
}

/**
 * 导入入库记录 API 地址
 */
export function importInboundRecord(): string {
  console.warn('importInboundRecord')
  return ''
}
