import type { AuditTypeEnum } from '@/api/common'
import request from '@/utils/request'

export interface GetAuditListEntity {
  page: number
  size: number
  queryType: number
  businessType: AuditTypeEnum | string
  quickQry?: string
}

export interface AuditPassEntity {
  'taskId': string
  'formPropertyJson': string
  'auditRecord.comment': string
  'auditRecord.remark': string
}

export function getAuditList(params: GetAuditListEntity) {
  return request.get<any>('rest/auditProcess/getAuditList', {
    params,
  })
}

export function getAuditDetail(taskId: string) {
  return request.get<any>('rest/auditProcess/getAuditDetail', {
    params: { taskId },
  })
}

export function auditPass(params: AuditPassEntity) {
  return request.post<any>('rest/auditProcess/auditPass', null, {
    params,
  })
}

export function auditRefuse(params: AuditPassEntity) {
  return request.post<any>('rest/auditProcess/auditRefuse', null, {
    params,
  })
}
