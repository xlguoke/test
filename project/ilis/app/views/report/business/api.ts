import type { WaitAuditReportEntity } from './ReportBusinessEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

// 审核
export interface AuditParams {
  /** 报告申请ID */
  applicationIds: string[]
  /** 审核状态 PASS通过 FAIL不通过 */
  pass: boolean
  /** 审核意见 */
  opinion: string
}

/** 视频列表 */
export interface VideoData {
  id: string
  labId: string
  objectId: string
  videoUrl?: string
  labName: string
  equName: string
  equType: string
  equVendor: string
  interfaceUrl: string
  configParam: string
  remark?: string
  appSecret: string
  appKey: string
  startDate: string
  endDate: string
  useLogIds?: string
  isMain?: string
  equipmentName: string
  equipmentCode: string
  testTaskParamDisplayName?: string
  testTaskParamId?: string
  temperatureValue?: string
  humidityValue?: string
  viewDateTimeStr?: string
}

/**
 * 获取报告业务管理分页列表
 * @param query
 */
export function getReportBusinessList(query: Record<string, any>) {
  if (query.applicationDateSearch?.length) {
    query.applicationDateStart = query.applicationDateSearch[0] || undefined
    query.applicationDateEnd = query.applicationDateSearch[1] || undefined
    delete query.applicationDateSearch
  }// todo:新增审核日期查询
  if (query.auditDateSearch?.length) {
    query.auditDateStart = query.auditDateSearch[0] || undefined
    query.auditDateEnd = query.auditDateSearch[1] || undefined
    delete query.auditDateSearch
  }
  return IlisApiHelper.get<IPageModel<WaitAuditReportEntity>>('rest/report/business/application/list', query)
}
/**
 * 获取报告业务详情
 * @param data
 */
export function getReportBusinessDetail(data: WaitAuditReportEntity) {
  return IlisApiHelper.get<WaitAuditReportEntity>(`rest/report/business/application/${data.id}`)
}
/**
 * 报告业务审核
 * @param params
 */
export function aduit(params: AuditParams) {
  return IlisApiHelper.post<WaitAuditReportEntity>('rest/report/business/application/audit', params)
}

/**
 * 获取视频列表
 */
export function videoDataApi(reportId: string) {
  return IlisApiHelper.get<VideoData[]>(`rest/consignVideoController/${reportId}/list`)
}

/**
 * 下载视频
 */
export function downloadVideo(data: VideoData) {
  return IlisApiHelper.post<VideoData>(`rest/consignVideoController/down`, data)
}
