import type { DeviceEntity } from '../../DeviceEntity.ts'
import type { CheckSendEntity } from '../checkSend/index.ts'
import type { EquipmentCheckPlanEntity } from '../plan/EquipmentCheckPlanEntity.ts'
import type { CertConfirmEntity } from './CertConfirmEntity.ts'
import type { EquipmentCheckConfirmEntity } from './EquipmentCheckConfirmEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

interface IEquipmentCheckConfirmDetail {
  check: EquipmentCheckConfirmEntity
  eqDepartName: string
  equipment: DeviceEntity
}

/**
 * # 获取设备检校确认分页列表
 */
export function getEquipmentCheckConfirmList(query: Record<string, any>) {
  if (query.checkDateSearch?.length) {
    query.checkDateBegin = query.checkDateSearch[0] || undefined
    query.checkDateEnd = query.checkDateSearch[1] || undefined
    delete query.checkDateSearch
  }
  if (query.planCheckDateSearch?.length) {
    query.planCheckDateBegin = query.planCheckDateSearch[0] || undefined
    query.planCheckDateEnd = query.planCheckDateSearch[1] || undefined
    delete query.planCheckDateSearch
  }
  if (query.confirmTimeSearch?.length) {
    query.confirmTimeBegin = query.confirmTimeSearch[0] || undefined
    query.confirmTimeEnd = query.confirmTimeSearch[1] || undefined
    delete query.confirmTimeSearch
  }
  return IlisApiHelper.get<IPageModel<EquipmentCheckConfirmEntity>>('checkController.do?datagrid', query)
}

/**
 * # 获取设备检校确认详情（不包含证书结果确认内容）
 */
export function getEquipmentCheckConfirmDetail(id: string) {
  return IlisApiHelper.get<{ obj: IEquipmentCheckConfirmDetail }>(`checkController.do?getById`, {
    id,
  })
}

/**
 * # 获取设备检校确认详情（证书结果确认内容）
 */
export function getEquipmentCheckConfirmItem(checkId: string) {
  return IlisApiHelper.postForm<{ obj: CertConfirmEntity[] }>(`checkController.do?getCheckedItemByCheckId`, {
    checkId,
  })
}

/**
 * # 获取设备检校确认上传文件
 */
export function getEquipmentCheckConfirmFileGroup(checkId: string) {
  return IlisApiHelper.postForm<{ obj: any[] }>(`/eqFileController.do?getFileGroupByRelationEntityId`, {
    relationEntityId: checkId,
  })
}

/**
 * # 按计划新增设备检校确认数据
 */
export function addEquipmentCheckConfirmByPlan(data: EquipmentCheckPlanEntity) {
  return IlisApiHelper.get(`checkController.do?planSave`, {
    planId: data.id,
  })
}

/**
 * # 按送检登记新增设备检校确认数据
 */
export function addEquipmentCheckConfirmBySend(data: CheckSendEntity[]) {
  return IlisApiHelper.post(`checkController.do?sendSave&sendDetailIds=${data?.map(i => i.id)?.join(',')}`)
}

/**
 * # 新增/编辑设备检校确认数据
 */
export function saveOrEditEquipmentCheckConfirm(data: Record<string, any>) {
  return IlisApiHelper.postForm(`checkController.do?saveCheck`, data)
}

/**
 * # 删除设备检校确认数据
 */
export function delEquipmentCheckConfirm(data: EquipmentCheckConfirmEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.get(`checkController?del`, { id })
}

/**
 * # 复制设备检校确认数据
 */
export function copyEquipmentCheckConfirm(data: Record<string, any>) {
  return IlisApiHelper.get(`checkController?copy`, data)
}

/**
 * # 导入设备检校确认数据
 */
export function importEquipmentCheckConfirm(file: File) {
  return IlisApiHelper.postForm<any>(`/checkController.do?importCheck`, { file })
}

/**
 * # 提交审批
 */
export function submitEquipmentCheckConfirm(data: Record<string, any>) {
  return IlisApiHelper.get(`checkController.do?submitCheckAudit`, data)
}

/**
 * # 撤销审批
 */
export function revokeCheckConfirm(data: EquipmentCheckConfirmEntity) {
  return IlisApiHelper.get(`/rest/checkController/revokeAudit/${data.id}`)
}

/**
 * # 直接确认
 */
export function directConfirm(data: { checkVo: EquipmentCheckConfirmEntity, checkItemIds: string[] }) {
  return IlisApiHelper.put(`rest/checkController/confirm`, data)
}

/**
 * # 检校确认导入项配置列表
 */
export function getCheckConfirmImportConfigList() {
  return IlisApiHelper.get(`/rest/check/import/item`)
}

/**
 * # 检校确认导入项配置列表（保存）
 */
export function saveCheckConfirmImportConfigList(data: Record<string, any>) {
  return IlisApiHelper.post(`/rest/check/import/item`, data)
}

/**
 * # 导入证书校验
 */
export function importCertificateVerify(data: Record<string, any>) {
  return IlisApiHelper.post<{ data: any }>(`checkController?importCertificateVerify`, data)
}

/**
 * # 保存导入证书
 */
export function saveCertificateVerify(data: Record<string, any>) {
  return IlisApiHelper.post<any>(`checkController?importCertificateSave`, data)
}

/**
 * # 批量清除证书
 */
export function batchDelCertificate(data: EquipmentCheckConfirmEntity[]) {
  return IlisApiHelper.get<any>(`checkController?delCertificate`, {
    ids: data.map(item => item.id)?.join(','),
  })
}

export enum VIOD_RESOTRE {
  /** 作废 */
  VIOD = 'DELETE',
  /** 恢复 */
  RESTORE = 'RESTORATION',
}
/**
 * 批量作废/恢复
 */
export function batchInvalid(data: { ids: string[], type: VIOD_RESOTRE }) {
  return IlisApiHelper.put<any>(`rest/checkController/bath-cancel`, data)
}
