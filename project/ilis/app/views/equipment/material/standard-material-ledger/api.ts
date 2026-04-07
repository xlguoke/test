import type { ResponseModel } from '../api'
import type { StandardMaterialLedgerEntity } from './entity/StandardMaterialLedgerEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export function getStandardMaterialLedgerList(params: Record<string, any>): Promise<any> {
  if (params.productionDateStart) {
    params.productionDateStart = `${params.productionDateStart} 00:00:00`
  }
  // 将productionDateEnd转换为yyyy-mm-dd 23:59:59
  if (params.productionDateEnd) {
    params.productionDateEnd = `${params.productionDateEnd} 23:59:59`
  }
  if (params.priorityWeight) {
    if (params.priorityWeight === '1') {
      params.isExpired = true
    }
    else if (params.priorityWeight === '2') {
      params.isWarning = true
    }
    delete params.priorityWeight
  }
  return IlisApiHelper.get<ResponseModel<StandardMaterialLedgerEntity>>('ref/material', params)
}

// 根据标准物质名称模糊查询标准物质名称列表(已去重) 返回字符串数组
export function getStandardMaterialLedgerNameList(params: Record<string, any>): Promise<any> {
  // 标准物质选择弹窗的搜索功能
  return IlisApiHelper.get('ref/material/names', params)
}

// 根据标准物质名称精确查询标准物质列表
export function getStandardMaterialLedgerListByMaterialName(params: Record<string, any>): Promise<any> {
  // 已选中标准物质，根据标准物质名称精确查询标准物质列表
  return IlisApiHelper.get('ref/material/list/by/name', params)
}

// 根据保管人名称模糊查询保管人列表(已去重)
export function getGuardianNameList(params: Record<string, any>): Promise<any> {
  return IlisApiHelper.get('ref/material/custodians', params)
}

/**
 * 获取标准物质台账详情
 */
export function getStandardMaterialLedgerDetail(id: string): Promise<any> {
  return IlisApiHelper.get<StandardMaterialLedgerEntity>(`ref/material/${id}`)
}

/**
 * 获取标准物质最新一次入库记录
 */
export function getLatestInboundRecord(inType: string, materialId: string): Promise<any> {
  // 当前inType只会是购置登记
  return IlisApiHelper.get(`ref/stock/in/material/latest/${inType}/${materialId}`)
}

/**
 * 新增标准物质台账
 */
export function createStandardMaterialLedger(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.post('ref/material', data)
}

/**
 * 更新标准物质台账
 */
export function updateStandardMaterialLedger(data: Record<string, any>): Promise<any> {
  return IlisApiHelper.put(`ref/material/${data.id}`, data)
}

/**
 * 删除标准物质台账
 */
export function deleteStandardMaterialLedger(ids: string, cascade?: boolean): Promise<any> {
  return IlisApiHelper.delete(`ref/material/${ids}`, {
    cascade,
  })
}

/**
 * 获取计量单位列表
 */
export function getUnitList(params: Record<string, any>): Promise<any> {
  return IlisApiHelper.get('ref/material/units', params)
}
