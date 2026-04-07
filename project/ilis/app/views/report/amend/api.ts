import type { AUDIT_STATUS, ReportAmendEntity } from './ReportAmendEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface ListQuery {
  status?: AUDIT_STATUS
  applicationDateStart?: string
  applicationDateEnd?: string
  /** 申请来源(pre-预委托，local-本地创建) */
  applicationFrom?: string
  q?: string
}

/**
 * 分页列表
 */
export function pageListApi(params: ListQuery) {
  return IlisApiHelper.get<any>('report/amend/application/list', params)
}

/**
 * 新增申请
 */
export interface SaveData {
  id?: string
  /** 申请ID,用以判断数据来源，有申请ID的为预委托申请，没有申请的为本地创建 */
  applicationId?: string
  reportId: string
  consignUnit: string
  consignCode: string
  reportCode: string
  applicant: string
  applicationDate: string
  /** 更正说明 */
  applicationDescription: string
  /** 项目负责人 */
  principal?: string
  /** 发出数量 */
  issueQty?: number
  /** 发出日期 */
  issueDate?: string
  /** 回收数量 */
  recycleQty?: number
  /** 销毁数量 */
  destructionQty?: number
  /** 自定义属性 */
  customs?: {
    customColumnId: string
    customColumnName: string
    customColumnValue: string
  }[]
  /** 附件id */
  attachments?: string[]
}
export function saveApi(data: SaveData) {
  const method = data.id ? 'put' : 'post'
  return IlisApiHelper[method]<string>('report/amend/application', data)
}

/**
 * 详情
 */
export function detailApi(params: { id: string }) {
  return IlisApiHelper.get<any>(`report/amend/application/${params.id}`)
}

/**
 * 提交申请
 */
export interface SubmitData {
  id: string
  presetAuditors: {
    activitiNodeId: string
    presetUserId: string
    presetUsername: string
    presetUserRealName: string
    processTaskName: string
    department: string
  }[]
  processForm: object
}
export function submitApi(data: SubmitData) {
  return IlisApiHelper.post<any>('report/amend/application/submit', data)
}

/** 撤回 */
export function revokeApi(row: ReportAmendEntity) {
  return IlisApiHelper.get<any>(`report/amend/application/revoke/${row.id}`)
}

/**
 * 删除
 */
export function deleteApi(row: ReportAmendEntity[]) {
  return IlisApiHelper.delete<any>(`report/amend/application/${row[0].id}`)
}

/**
 * 可选报告
 */
export function getWaitAmendReportApi(params: {
  issueDateStart?: string
  issueDateEnd?: string
  q?: string
}) {
  return IlisApiHelper.get<any>('report/amend/application/selectable/reports', params)
}

/** 申请详情 */
export function getApplicationDetailApi(params: { id: string }) {
  return IlisApiHelper.get<any>(`report/amend/application/${params.id}/detail`)
}
