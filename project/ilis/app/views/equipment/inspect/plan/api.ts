import type { EquipmentInspectDeviceEntity } from './EquipmentInspectDeviceEntity.ts'
import type { EquipmentInspectPlanEntity } from './EquipmentInspectPlanEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备核查计划分页列表
 */
export function getEquipmentInspectPlanList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EquipmentInspectPlanEntity>>('rest/eq/inspect/plan/list', query)
}

/**
 * # 获取设备核查计划详情
 */
export function getEquipmentInspectPlanDetail(data: EquipmentInspectPlanEntity) {
  return IlisApiHelper.get<EquipmentInspectPlanEntity>(`rest/eq/inspect/plan/${data.id}`)
}

/**
 * # 获取设备核查计划设备明细
 */
export function getEquipmentInspectPlanEqDetail(data: EquipmentInspectPlanEntity) {
  return IlisApiHelper.get<{ rows: EquipmentInspectDeviceEntity[] }>(`rest/eq/inspect/plan/${data.id}/detail`)
}

/**
 * # 保存设备核查计划数据（新增/编辑）
 */
export function saveEquipmentInspectPlan(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/inspect/plan`, data)
}

/**
 * # 删除设备核查计划数据
 */
export function delEquipmentInspectPlan(data: EquipmentInspectPlanEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/eq/inspect/plan/${id}`)
}

/**
 * # 提交设备核查计划审批
 */
export function submitEquipmentInspectPlan(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/inspect/plan/submit`, data)
}
