import type { DeviceEntity } from '../../DeviceEntity'
import type { EquipmentInventoryPlanEntity } from './EquipmentInventoryPlanEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备盘点计划分页列表
 */
export function getEquipmentInventoryPlanList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EquipmentInventoryPlanEntity>>('rest/inventory/plan/list', query)
}

/**
 * # 获取设备盘点计划详情
 */
export function getEquipmentInventoryPlanDetail(data: EquipmentInventoryPlanEntity) {
  return IlisApiHelper.get<EquipmentInventoryPlanEntity>(`rest/inventory/plan/${data.id}`)
}

/**
 * # 获取设备盘点计划设备详情
 */
export function getEquipmentInventoryPlanEqDetail(data: EquipmentInventoryPlanEntity) {
  return IlisApiHelper.get<DeviceEntity>(`rest/inventory/plan/eq/list/${data.id}`)
}

/**
 * # 新增设备盘点计划
 */
export function addEquipmentInventoryPlan(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/inventory/plan`, data)
}
/**
 * # 编辑设备盘点计划
 */
export function editEquipmentInventoryPlan(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/inventory/plan`, data)
}

/**
 * # 删除设备盘点计划数据
 */
export function delEquipmentInventoryPlan(data: EquipmentInventoryPlanEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/inventory/plan/${id}`)
}

/**
 * # 提交设备盘点计划审批
 */
export function submitEquipmentInventoryPlan(data: Record<string, any>) {
  return IlisApiHelper.postForm(`rest/inventory/plan/submit`, data)
}

/**
 * # 设备盘点计划撤回
 */
export function revokeEquipmentInventoryPlan(data: EquipmentInventoryPlanEntity) {
  return IlisApiHelper.post(`rest/inventory/plan/recall/${data.id}`)
}
