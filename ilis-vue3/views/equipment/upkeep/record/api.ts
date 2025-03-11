import type { EquipmentUpkeepRecordEntity } from './EquipmentUpkeepRecordEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备保养登记分页列表
 */
export function getEquipmentUpkeepRecordList(query: Record<string, any>) {
  if (query.commonDate?.length) {
    query.commonDateBegin = query.commonDate[0] || undefined
    query.commonDateEnd = query.commonDate[1] || undefined
    delete query.commonDate
  }
  return IlisApiHelper.get<IPageModel<EquipmentUpkeepRecordEntity>>('rest/eq/upkeep/record/datagrid', query)
}

/**
 * # 获取设备保养登记详情
 */
export function getEquipmentUpkeepRecordDetail(data: EquipmentUpkeepRecordEntity) {
  return IlisApiHelper.get<EquipmentUpkeepRecordEntity>(`rest/eq/upkeep/record/${data.id}`)
}

/**
 * # 按计划设备新增、按设备新增保养登记
 */
export function createEquipmentUpkeepRecord(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/upkeep/record/create`, data)
}

/**
 * # 保存设备保养登记数据（新增/编辑）
 */
export function saveEquipmentUpkeepRecord(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/upkeep/record`, data)
}

/**
 * # 批量编辑设备保养登记数据
 */
export function batchSaveEquipmentUpkeepRecord(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/eq/upkeep/record/batch/save`, data)
}

/**
 * # 删除设备保养登记数据
 */
export function delEquipmentUpkeepRecord(data: EquipmentUpkeepRecordEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/eq/upkeep/record/${id}`)
}

/**
 * # 批量更新保养项目
 */
export function updateEquipmentUpkeepRecordProject(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/upkeep/record/update/upkeep-project`, data)
}

/**
 * # 批量更新登记信息
 */
export function updateEquipmentUpkeepRecordBaseData(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/upkeep/record/batch/save`, data)
}
