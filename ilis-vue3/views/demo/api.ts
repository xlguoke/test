import type { EquipmentInventoryPlanEntity } from './EquipmentInventoryPlanEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备盘点计划分页列表
 */
export function getEquipmentInventoryPlanList(query: Record<string, any>) {
  if (query.commonDate?.length) {
    query.commonDateBegin = query.commonDate[0] || undefined
    query.commonDateEnd = query.commonDate[1] || undefined
    delete query.commonDate
  }
  return IlisApiHelper.get<IPageModel<EquipmentInventoryPlanEntity>>('rest/eq/allot/controller/datagrid', query)
}

/**
 * # 获取设备盘点计划详情
 */
export function getEquipmentInventoryPlanDetail(data: EquipmentInventoryPlanEntity) {
  return IlisApiHelper.get<EquipmentInventoryPlanEntity>(`rest/eq/allot/controller/${data.id}`)
}

/**
 * # 保存设备盘点计划数据（新增/编辑）
 */
export function saveEquipmentInventoryPlan(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/allot/controller`, data)
}

/**
 * # 删除设备盘点计划数据
 */
export function delEquipmentInventoryPlan(data: EquipmentInventoryPlanEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/eq/allot/controller/${id}`)
}

/**
 * # 提交设备盘点计划审批
 */
export function submitEquipmentInventoryPlan(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/allot/controller/${data.id}/submit`, data)
}
