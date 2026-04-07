import type { EquipmentUsageRecordEntity } from './EquipmentUsageRecordEntity'
import type { IPageModel } from '~/interface/IPageModel'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取设备使用记录分页列表
 */
export function getEqUseRecordList(query: Record<string, any>) {
  if (query.commonDate?.length) {
    query.commonDateBegin = query.commonDate[0] || undefined
    query.commonDateEnd = query.commonDate[1] || undefined
    delete query.commonDate
  }
  return IlisApiHelper.get<IPageModel<EquipmentUsageRecordEntity>>('rest/equipment/useRecord', query)
}

/**
 * # 删除设备使用记录
 */
export function deleteEqUseRecord(id: string) {
  return IlisApiHelper.delete(`testTaskUseEquipmentController/${id}`)
}

export interface EqAuthInfo {
  auth: boolean
  authUserList?: string[]
}

/**
 * # 获取设备授权信息（合并传入的所有设备授权人员）
 */
export function getEqAuthInfo(ids: string) {
  return IlisApiHelper.get<IResponseCommonEntity<EqAuthInfo>>('rest/eq/auth/sys/user', { ids })
}

interface EqUseRecordEntity {
  startUseTime?: string
  endUseTime?: string
  startUseState?: string
  endUseState?: string
  userName?: string
  userId?: string
  usePlace?: string
  testTaskId?: string
  testTaskCode?: string
  testObjectCode?: string
  projectName?: string
  testTaskParamId?: string
  testTaskParamName?: string
  qualificationType?: string
}

export interface AddEqUseRecordEntity extends EqUseRecordEntity {
  equipmentIds: string[]
}

/**
 * 新增设备使用记录
 */
export function addEqUseRecord(data: AddEqUseRecordEntity) {
  return IlisApiHelper.post('/rest/equipment/use/record', data)
}

export interface UpdateEqUseRecordEntity extends EqUseRecordEntity {
  ids: string[]
}

/**
 * 更新设备使用记录
 */
export function updateEqUseRecord(data: UpdateEqUseRecordEntity) {
  return IlisApiHelper.put('/rest/equipment/use/record', data)
}
