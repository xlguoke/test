import type { EquipmentUpkeepPlanEntity } from './EquipmentUpkeepPlanEntity.ts'
import type { EquipmentUpkeepDeviceEntity } from './EquipmentUpkeepDeviceEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备保养计划分页列表
 */
export function getEquipmentUpkeepPlanList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EquipmentUpkeepPlanEntity>>('rest/eq/upkeep/plan/datagrid', query)
}

/**
 * # 获取设备保养计划详情
 */
export function getEquipmentUpkeepPlanDetail(data: EquipmentUpkeepPlanEntity) {
  return IlisApiHelper.get<EquipmentUpkeepPlanEntity>(`rest/eq/upkeep/plan/${data.id}`)
}

/**
 * # 获取设备保养计划设备明细
 */
export function getEquipmentUpkeepPlanEqDetail(data: EquipmentUpkeepPlanEntity) {
  return IlisApiHelper.get<{ rows: EquipmentUpkeepDeviceEntity[] }>(`rest/eq/upkeep/plan/${data.id}/detail`)
}

/**
 * # 保存设备保养计划数据（新增/编辑）
 */
export function saveEquipmentUpkeepPlan(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/upkeep/plan`, data)
}

/**
 * # 删除设备保养计划数据
 */
export function delEquipmentUpkeepPlan(data: EquipmentUpkeepPlanEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/eq/upkeep/plan/${id}`)
}

/**
 * # 提交设备保养计划审批
 */
export function submitEquipmentUpkeepPlan(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/upkeep/plan/${data.id}/submit`, data)
}

/**
 * # 设备保养计划到期提醒
 */
export function sendEquipmentUpkeepPlan(data: Record<string, any>) {
  return IlisApiHelper.get(`rest/eq/upkeep/plan/send`, data)
}

/**
 * # 获取设备保养选择设备列表
 */
export function getEquipmentSelectList(data: Record<string, any>) {
  return IlisApiHelper.get(`rest/eq/upkeep/plan/select/eq`, data)
}

/**
 * # 撤回设备保养计划审批
 */
export function revokeEquipmentUpkeepPlan(data: EquipmentUpkeepPlanEntity) {
  return IlisApiHelper.get(`rest/eq/upkeep/plan/${data.id}/revoke`)
}
