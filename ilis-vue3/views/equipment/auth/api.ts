import type { EquipmentAuthEntity } from './EquipmentAuthEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取授权分页列表
 */
export function getAuthList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EquipmentAuthEntity>>('equipmentNewController.do?datagrid', query)
}

interface GetEqAuthUserQuery {
  isPager?: boolean
  order?: string
  orderBy?: string
  page?: number
  quickQry?: string
  size?: number
  processId?: string
}

export interface EqAuthUserEntity {
  id: string
  personName: string
  identityNumber: string
  department: string
  personStatus: '0' | '1'
  authStatus: string
}

/**
 * # 获取设备授权用户
 */
export function getEqAuthUser(id: string, query: GetEqAuthUserQuery) {
  return IlisApiHelper.get<IPageModel<EqAuthUserEntity>>(`rest/eq/auth/${id}/auth/info`, query)
}

export interface EqAuditAuthUserEntity {
  name: string
  equipmentSn: string
  detail: EqAuthUserEntity[]
}

/**
 * # 获取审核详情处设备授权用户
 */
export function getEqAuditAuthUser(id: string) {
  return IlisApiHelper.get<EqAuditAuthUserEntity>(`rest/eq/auth/${id}`)
}

interface AddEqAuthUserEntity {
  userIds: string
  formPropertyJson?: string
  presetAuditers?: string
}

/**
 * # 添加授权人员
 */
export function addEqAuthUser(id: string, data: AddEqAuthUserEntity) {
  return IlisApiHelper.post<any>(`rest/eq/auth/${id}`, data)
}

/**
 * # 删除授权人员
 */
export function delEqAuthUser(id: string) {
  return IlisApiHelper.delete<any>(`rest/eq/auth/${id}`)
}

/**
 * # 一键清理离职员工
 */
export function clearOutUser(ids: string) {
  return IlisApiHelper.delete<any>(`rest/eq/auth/out/user?ids=${ids}`)
}

/**
 * # 批量获取设备的批次id
 */
export function getEqProcessId(ids: string) {
  return IlisApiHelper.get<any>(`rest/eq/auth/get/process/id`, { ids })
}

/**
 * # 获取日志
 */
export function getAuthLog(id: string) {
  return IlisApiHelper.get<any>(`rest/eq/auth/${id}/log`)
}

export interface AuthRecordEntity {
  count: number
  processId: string
  createTime: number
  effectiveDate: number
  createName: string
}

/**
 * # 授权记录
 */
export function getAuthRecord(id: string) {
  return IlisApiHelper.get<AuthRecordEntity>(`rest/eq/auth/${id}/record`)
}
