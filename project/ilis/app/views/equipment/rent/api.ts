import type { EquipmentRentEntity } from './EquipmentRentEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 设备租借列表
 */
export function getEquipmentRentList(query: Record<string, any>) {
  if (query.commonDate?.length) {
    query.commonDateBegin = query.commonDate[0] || undefined
    query.commonDateEnd = query.commonDate[1] || undefined
    delete query.commonDate
  }
  return IlisApiHelper.get<IPageModel<EquipmentRentEntity>>('rest/eq/rent/controller/datagrid', query)
}

/**
 * # 删除设备租借
 */
export function deleteEquipmentRent(data: EquipmentRentEntity[]) {
  return IlisApiHelper.delete(`rest/eq/rent/controller/${data[0]?.id}`)
}

/**
 * # 设备租借详情
 */
export function getEquipmentRentDetail(data: EquipmentRentEntity) {
  return IlisApiHelper.get<EquipmentRentEntity>(`rest/eq/rent/controller/${data.id}`)
}

/**
 * # 保存设备租借信息
 */
export function addEquipmentRent(data: EquipmentRentEntity) {
  return IlisApiHelper.post(`rest/eq/rent/controller`, data)
}

/**
 * # 提交租借信息审批
 */
export function submitEquipmentRentProcess(data: Record<string, any>) {
  return IlisApiHelper.put(`rest/eq/rent/controller/submit`, data)
}

/**
 * # 提交租借信息审批(需要签名的)
 */
export function submitEquipmentRentProcessBySign(unitCode: string, id: string, keyId: string, signerImgData?: string) {
  return IlisApiHelper.put(`rest/eq/rent/signer/${unitCode}/${id}/submit`, { keyId, signerImgData })
}

/**
 * # 保存设备归还信息（需要签名）
 */
export function submitEquipmentReturn(unitCode: string, id: string, keyId: string, signerImgData?: string) {
  return IlisApiHelper.put(`rest/eq/rent/signer/${unitCode}/${id}/return`, { keyId, signerImgData })
}

/**
 * # 变更签名状态
 */
export function changeSignStatus(id: string, type: string, keyId: string) {
  return IlisApiHelper.post(`rest/eq/rent/controller/${id}/${type}/signer`, {
    keyId,
  })
}
