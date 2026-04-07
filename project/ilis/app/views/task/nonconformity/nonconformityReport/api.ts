import type { UnqualifiedReportEntity } from './UnqualifiedReportEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

// AUDIT-审核中 PASS-审核通过 REJECTED-审核未通过
export enum StatusType {
  审核中 = 'AUDIT',
  审核通过 = 'PASS',
  审核未通过 = 'REJECTED',
}

export const StatusTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '审核中', key: StatusType.审核中 },
  { label: '已通过', key: StatusType.审核通过 },
  { label: '未通过', key: StatusType.审核未通过 },
])

export interface NonconformityReportDTO {
  id: 'string'
  testTaskId: 'string'
  description: 'string'
  status: StatusType
  statusDesc: 'string'
}

/**
 * # 上报列表
 */
export function getNonconformityReportList(testTaskId: string) {
  return IlisApiHelper.get<NonconformityReportDTO[]>(`rest/task/nonconformity/reports/list/${testTaskId}`)
}

/**
 * # 不合格上报默认不合格情况描述
 */
export function getNonconformityReportDesc(testTaskId: string) {
  return IlisApiHelper.get<UnqualifiedReportEntity[]>(`rest/task/nonconformity/reports/default/desc/${testTaskId}`)
}

export interface NonconformityReportEntity {
  /**
   * 不合格情况
   */
  description: string
  /**
   * 提交审核表单内容
   */
  formPropertyStr?: string
  /**
   * 提交审核预设人员
   */
  presetAuditorsStr?: string
  /**
   * 任务id
   */
  testTaskId: string
}

/**
 * # 不合格上报
 */
export function nonconformityReport(data: NonconformityReportEntity) {
  return IlisApiHelper.post<any>(`rest/task/nonconformity/reports`, data)
}

/**
 * # 不合格上报撤回
 */
export function nonconformityReportRecall(id: string) {
  return IlisApiHelper.delete<any>(`rest/task/nonconformity/reports/recall/${id}`)
}

export class GetNonconformityReportPageListQuery {
  /**
   * 创建结束时间 , 'yyyy-mm-dd'
   */
  createDateEnd?: string
  /**
   * 创建开始时间 , 'yyyy-mm-dd'
   */
  createDateStart?: string
  /**
   * 排序方式(正序-ASC/倒序-DESC)
   */
  order?: string
  /**
   * 排序列
   */
  orderBy?: string
  /**
   * 快速查询参数 create_date
   */
  quickQry?: string
  /**
   * 状态  AUDIT-审核中 PASS-审核通过 REJECTED-审核未通过
   */
  status?: StatusType
}

export function getNonconformityReportPageList(query: GetNonconformityReportPageListQuery) {
  return IlisApiHelper.get<any>(`rest/task/nonconformity/reports/page`, query)
}

export function nonconformityReportExport(query: GetNonconformityReportPageListQuery) {
  return IlisApiHelper.get<any>(`rest/task/nonconformity/reports/export`, query, {
    responseType: 'blob',
  })
}

export function getNonconformityReportAuditDetail(id: string) {
  return IlisApiHelper.get<any>(`rest/task/nonconformity/reports/detail/${id}`)
}
