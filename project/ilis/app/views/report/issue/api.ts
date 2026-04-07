import type { IssueForm } from './addEdit/addEditEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 报告发放-发放信息 */
export async function issueDetail(issueId: string) {
  return await IlisApiHelper.postForm<any>(`reportIssueController.do?getDetail`, { issueId })
}

/** 报告发放-报告信息 */
export async function reportDetail(reportIds: string[]) {
  return await IlisApiHelper.get<any>(`rest/reportIssueController/issue/report/info`, { param: reportIds.toString() })
}

/** 获取预委托申请纸质报告填入的申请信息 */
export interface PaperApplyInfo {
  preIssueCount: string
  preIssueWay: string
  preReceiver: string
  preAddresseePhone: string
  preAddressee: string
  preAddresseeAddr: string
  preAddresseeCompany: string
}
export async function paperApplyInfo(reportId: string) {
  return await IlisApiHelper.get<PaperApplyInfo>(`rest/reportIssueController/pre/issue/info?reportId=${reportId}`)
}

/** 根据邮寄项目id获取邮寄信息 */
export async function mailPostInfo(id: string) {
  return await IlisApiHelper.get<any>(`rest/post/${id}`)
}

/** 根据报告id获取邮寄信息 */
export async function mailPostInfoByReportId(reportId: string) {
  return await IlisApiHelper.get<any>(`rest/post/consign?reportId=${reportId}`)
}

/** 确认发放 */
export interface ConfirmIssueData {
  /** 报告id */
  reportIds: string[]
  /** 附件id */
  attachmentIds: string[]
  /** 发放信息 */
  reportIssueEntity: IssueForm
}
/** 确认发放 */
export async function issueSave(data: ConfirmIssueData) {
  return await IlisApiHelper.postForm<any>(`reportIssueController.do?saveOrUpdate`, {
    saveParamStr: JSON.stringify(data),
  })
}

/** 签字反馈 */
export async function issueSignResult(reportId: string) {
  return await IlisApiHelper.get<any>(`reportIssueController.do?getReportIssueInfo&reportId=${reportId}`)
}

/** 报告发放-发放中列表 */
export async function getBeingIssueList(params: Record<string, any>) {
  if (params.issueDateSearch?.length) {
    params.issueDateStart = params.issueDateSearch[0]
    params.issueDateEnd = params.issueDateSearch[1]
    delete params.issueDateSearch
  }
  return await IlisApiHelper.get<any>(`rest/reportIssueController/issue/ing/pages`, params)
}

/** 撤回 */
export async function issueCancel(issueId: string) {
  return await IlisApiHelper.postForm<any>(`reportIssueController.do?undoIssue`, { issueId })
}

/** 获取二维码 */
export async function getSignQrCode(phone: string, reportIds: string) {
  return await IlisApiHelper.get<any>(`rest/report/issue/sign/qrcode`, {
    phone,
    reportIds,
  })
}
