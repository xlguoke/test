import type { DeviceEntity } from '../../DeviceEntity'
import { EquipmentCheckParamEntity } from './EquipmentCheckParamEntity'
import type { EquipmentCheckParamEqEntity } from './EquipmentCheckParamEqEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IPageModel } from '~/interface/IPageModel'

/**
 * # 获取检校参数分页列表
 */
export function getParamPage(obj: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EquipmentCheckParamEntity>>('rest/checkItemController.do?datagrid', obj)
}

/**
 * # 新增参数
 */
export function addParam(data: Record<string, any>) {
  delete data.createDate
  delete data.updateDate
  const options = EquipmentCheckParamEntity.getOptions('checkType')
  data.checkType = options?.find(item => item.value === data.checkType)?.label
  return IlisApiHelper.postForm(`rest/checkItemController.do?saveItem`, data)
}

/**
 * # 新增设备
 */
export function addParamEq(data: DeviceEntity[]) {
  const ids = data.map(item => item.id)?.join(',')
  return IlisApiHelper.post(`rest/checkItemController/eq`, { id: ids })
}

/**
 * # 删除
 */
export function deleteParam(data: EquipmentCheckParamEntity[]) {
  const ids = data?.map(item => item.id)?.join(',')
  return IlisApiHelper.delete(`rest/checkItemController.do?delete&id=${ids}`)
}

/**
 * # 删除设备
 */
export function deleteParamEq(data: EquipmentCheckParamEqEntity[]) {
  const ids = data.map(item => item.id)?.join(',')
  return IlisApiHelper.delete(`rest/checkItemController/eq`, { data: {
    id: ids,
  } })
}

/**
 * # 导入
 */
export function importParam(file: any) {
  return IlisApiHelper.postForm<any>(`rest/equipmentNewController?importCheckItem`, { file })
}
