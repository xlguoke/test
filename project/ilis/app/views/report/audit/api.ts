import type { IReportInfo } from '../approve/api'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** # 查询报告附件信息 */
export async function getReportFile(reportId: string) {
  return await IlisApiHelper.get<any>('reportAuditController.do?getReportDetailGeneral', {
    reportId,
    requestFrom: 'audit_detail',
  })
}

/** # 报告关联信息详情 */
export async function getAuditReportRelatedInfoDetail(reportId: string) {
  return await IlisApiHelper.get<IReportInfo>(`/reportController/audit/related/info/detail/${reportId}`)
}
