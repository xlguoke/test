import type { ReportCompiledEntity } from './ReportCompiledEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取编制报告分页列表
 */
export function getReportCompiledList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<ReportCompiledEntity>>('reportCreateController.do?datagrid', query)
}

/** # 检查是否具备编辑报告的权限 */
export async function checkEditPermission(row: ReportCompiledEntity) {
  const { data } = await IlisApiHelper.postForm<{ obj: boolean }>('reportCreateController.do?curUserCanModifyReport', { reportId: row.id })
  return data.obj
}

/** # 删除编制报告 */
export function deleteReportCompiled(rows: ReportCompiledEntity[]) {
  return IlisApiHelper.get('reportCreateController/deleteSynthesisReport.do', {
    reportId: rows.map(item => item.id)?.join(','),
  })
}

/** # 修改报告编号 */
export function updateReportNumber(row: ReportCompiledEntity, newReportSn: string) {
  return IlisApiHelper.postForm('reportCreateController.do?modifyReportSn', {
    reportId: row.id,
    newReportSn,
  })
}

/** # 作废报告 */
export function invalidReport(row: ReportCompiledEntity, reason: string) {
  return IlisApiHelper.postForm('reportCreateController.do?discardReport', {
    reportId: row.id,
    reason,
  })
}

/** # 取消作废报告 */
export function cancelInvalidReport(row: ReportCompiledEntity) {
  return IlisApiHelper.postForm('reportCreateController.do?recoverReport', {
    reportId: row.id,
  })
}

export interface OverdueReportData {
  day: number
  count: number
}

/** # 超期报告查询 */
export function getOverdueReportData() {
  return IlisApiHelper.get<{ obj: OverdueReportData }>('rest/reportCreateController/qryOverdueMsg')
}
