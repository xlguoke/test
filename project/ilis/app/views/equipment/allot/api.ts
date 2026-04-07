import type { EquipmentAllotEntity } from './EquipmentAllotEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备调拨分页列表
 */
export function getEquipmentAllotList(query: Record<string, any>) {
  if (query.commonDate?.length) {
    query.commonDateBegin = query.commonDate[0] || undefined
    query.commonDateEnd = query.commonDate[1] || undefined
    delete query.commonDate
  }
  return IlisApiHelper.get<IPageModel<EquipmentAllotEntity>>('rest/eq/allot/controller/datagrid', query)
}

/**
 * # 获取设备调拨详情
 */
export function getEquipmentAllotDetail(data: EquipmentAllotEntity) {
  return IlisApiHelper.get<EquipmentAllotEntity>(`rest/eq/allot/controller/${data.id}`)
}

/**
 * # 保存设备调拨数据（新增/编辑）
 */
export function saveEquipmentAllot(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/allot/controller`, data)
}

/**
 * # 删除设备调拨数据
 */
export function delEquipmentAllot(data: EquipmentAllotEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/eq/allot/controller/${id}`)
}

/**
 * # 提交设备调拨审批
 */
export function submitEquipmentAllot(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/allot/controller/${data.id}/submit`, data)
}
