import type { DeviceEntity } from '../DeviceEntity.ts'
import type { EquipmentAssetEntity } from './EquipmentAssetEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备固定资产分页列表
 */
export function getEquipmentAssetList(query: Record<string, any>) {
  if (query.buyDateSearch?.length) {
    query.buyDateStart = query.buyDateSearch[0] || undefined
    query.buyDateEnd = query.buyDateSearch[1] || undefined
    delete query.buyDateSearch
  }
  return IlisApiHelper.get<IPageModel<EquipmentAssetEntity>>('rest/equipment/assets/page', query)
}

/**
 * # 获取设备固定资产详情
 */
export function getEquipmentAssetDetail(data: EquipmentAssetEntity) {
  return IlisApiHelper.get<EquipmentAssetEntity>(`rest/equipment/assets/${data.id}`)
}

/**
 * # 新增设备固定资产数据
 */
export function addEquipmentAsset(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/equipment/assets`, data)
}

/**
 * # 编辑设备固定资产数据
 */
export function editEquipmentAsset(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/equipment/assets/${data.id}`, data)
}

/**
 * # 批量编辑设备固定资产数据
 */
export function batchEditEquipmentAsset(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/equipment/assets/batch/update`, data)
}

/**
 * # 删除设备固定资产数据
 */
export function delEquipmentAsset(data: EquipmentAssetEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/equipment/assets/${id}`)
}

/**
 * # 复制设备固定资产数据
 */
export function copyEquipmentAsset(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/equipment/assets/copy`, data)
}

/**
 * # 导入设备固定资产数据
 */
export function importEquipmentAsset(file: File) {
  return IlisApiHelper.postForm<any>(`rest/equipment/assets/import`, { file })
}

/**
 * # 校验设备固定资产编号
 */
export function checkEquipmentAsset(obj: { id?: string, assetSn: string }) {
  return IlisApiHelper.post<{ assets: boolean, equipmentList: DeviceEntity[] }>(`rest/equipment/assets/check/assets/sn`, obj)
}

/**
 * # 引用检测设备创建固定资产
 */
export function equipmentAssetAddByDevice(obj: { query?: Record<string, any>, id?: string, key?: string }) {
  return IlisApiHelper.post<any>(`rest/equipment/assets/sync/${obj.key}`, {
    ...obj.query,
    id: obj.id,
  })
}
