import type { EquipmentAssetEntity } from '../../asset/EquipmentAssetEntity'
import type { DeviceEntity } from '../../DeviceEntity'
import type { EquipmentInventoryRecordEntity } from './EquipmentInventoryRecordEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备盘点记录分页列表
 */
export function getEquipmentInventoryRecordList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EquipmentInventoryRecordEntity>>('rest/eq/inventory/list', query)
}

/**
 * # 获取设备盘点记录详情
 */
export function getEquipmentInventoryRecordDetail(data: EquipmentInventoryRecordEntity) {
  return IlisApiHelper.get<EquipmentInventoryRecordEntity>(`rest/eq/inventory/${data.id}`)
}

/**
 * # 新增设备盘点记录
 */
export function saveEquipmentInventoryRecord(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/inventory`, data)
}

/**
 * # 编辑设备盘点记录(仅基础信息)
 */
export function editEquipmentInventoryRecord(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/inventory`, data)
}

/**
 * # 删除设备盘点记录数据
 */
export function delEquipmentInventoryRecord(data: EquipmentInventoryRecordEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/eq/inventory/${id}`)
}

/**
 * # 查询设备登记记录设备列表
 */
export function getEquipmentInventoryCheckInEq(data: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<DeviceEntity>>(`rest/eq/inventory/eq/list`, data)
}

/**
 * # 删除设备盘点记录的设备
 */
export function delEquipmentInventoryCheckInEq(data: EquipmentAssetEntity[]) {
  const ids = data?.map(item => item.id)
  return IlisApiHelper.post(`rest/eq/inventory/remove/eq`, ids)
}

/**
 * # 增加设备盘点记录的设备
 */
export function addEquipmentInventoryCheckInEq(data: { inventoryId: string, assetIds: string[] }) {
  return IlisApiHelper.post(`rest/eq/inventory/add/eq`, data)
}

/**
 * # 设备登记
 */
export function equipmentInventoryCheckIn(data: { inventorId: string, inventoryAssets: any[] }) {
  return IlisApiHelper.post(`rest/eq/inventory/register`, data)
}

interface EquipmentInventoryCheckInBatchData {
  inventorId: string
  inventoryAssetIds: string[]
  status: string
  inventoryTime: string
  inventoryUserId: string
  inventoryUserName: string
  remark: string
}

/**
 * # 设备批量登记
 */
export function equipmentInventoryCheckInBatch(data: EquipmentInventoryCheckInBatchData) {
  return IlisApiHelper.post(`rest/eq/inventory/batch/register`, data)
}

export interface EquipmentInventoryStatisticsCountData {
  /** # 已盘点正常 */
  20: string
  /** # 已盘点异常 */
  30: string
  /** # 已盘点位置异常 */
  40: string
  /** # 盘点进度 */
  inventoryProgress: string
}

/**
 * # 盘点记录静态统计数据
 */
export function getEquipmentInventoryStatisticsCount(data: EquipmentInventoryRecordEntity) {
  return IlisApiHelper.get<EquipmentInventoryStatisticsCountData>(`rest/eq/inventory/statistics/count`, { inventoryId: data.id })
}

/**
 * # 提交设备盘点记录审批
 */
export function submitEquipmentInventoryRecord(data: Record<string, any>) {
  return IlisApiHelper.postForm(`rest/eq/inventory/submit`, data)
}

/**
 * # 撤回
 */
export function revokeEquipmentInventoryRecord(data: EquipmentInventoryRecordEntity) {
  return IlisApiHelper.post(`rest/eq/inventory/recall/${data.id}`, data)
}
