import type { EquipmentAllotApplyEntity } from './EquipmentAllotApplyEntity'
import type { AllotType } from '~/enum/AllotType'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备调拨申请分页列表
 */
export function getEquipmentAllotList(query: Record<string, any>) {
  if (query.commonDate?.length) {
    query.commonDateBegin = query.commonDate[0] || undefined
    query.commonDateEnd = query.commonDate[1] || undefined
    delete query.commonDate
  }
  return IlisApiHelper.get<IPageModel<EquipmentAllotApplyEntity>>('rest/equipment/allot/apply/page', query)
}

/**
 * # 获取设备调拨申请详情
 */
export function getEquipmentAllotDetail(data: EquipmentAllotApplyEntity) {
  return IlisApiHelper.get<EquipmentAllotApplyEntity>(`rest/equipment/allot/apply/${data.id}`)
}

/**
 * # 新增设备调拨申请数据
 * 调拨类型（ASSET：固定资产调拨，EQ：设备调拨）
 */
export function addEquipmentAllot(type: AllotType, data: Record<string, any>) {
  return IlisApiHelper.post(`rest/equipment/allot/apply/${type}`, data)
}

/**
 * # 编辑设备调拨申请数据
 * 调拨类型（ASSET：固定资产调拨，EQ：设备调拨）
 */
export function editEquipmentAllot(type: AllotType, data: Record<string, any>) {
  return IlisApiHelper.put(`rest/equipment/allot/apply/${type}/${data.id}`, data)
}

/**
 * # 删除设备调拨申请数据
 */
export function delEquipmentAllot(data: EquipmentAllotApplyEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/equipment/allot/apply/${id}`)
}

/**
 * # 提交设备调拨申请审批
 */
export function submitEquipmentAllot(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/equipment/allot/apply/${data.id}/submit`, data)
}

/**
 * # 撤回设备调拨申请审批
 */
export function revokeEquipmentAllot(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/equipment/allot/apply/${data.id}/revoke`, data)
}

/**
 * # 获取当前待审核人员
 */
export function getAuditUser(id: string) {
  return IlisApiHelper.get<any>(`rest/auditProcess/${id}/audit-user`)
}

/**
 * # 获取审核不通过原因
 */
export function getNoPassReason(id: string) {
  return IlisApiHelper.get<any>(`rest/auditProcess/${id}/no-pass-reason`)
}
