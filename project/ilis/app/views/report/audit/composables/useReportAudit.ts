import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import RollBackModal from '~/components/ilisComponent/rollback/RollBackModal.vue'
import openHitekUdrTool from '~/utils/UDR'
import { getOfflineReportFile, isOfflineReportFun } from '../../approve/api'
import NoticeModal from '../../approve/components/NoticeModal.vue'
import { getReportFile } from '../api'
import AuditPassModal from '../components/AuditPassModal.vue'

interface IReportFile {
  id: string
  dataType: string
  name?: string
  code?: string
  fileid?: string
  fileName?: string
  status?: string
}

export function useReportAudit() {
  const urlParams = new URLSearchParams(window.location.search)
  const page = urlParams.get('page') || ''
  const reportId = urlParams.get('reportId') || ''
  const reportType = urlParams.get('reportType') || ''
  const type = urlParams.get('type') || ''
  const testTaskId = urlParams.get('testTaskId') || ''

  /** # 审核通过 */
  async function auditPass() {
    const isWaitSignReport = urlParams.get('isWaitSignReport') || ''
    const url = `reportAuditController.do?goReportAuditPass&reportIds=${reportId}&detailPass=detailPass&isWaitSignReport=${isWaitSignReport}`
    await AnyDialogHelper.showModel(AuditPassModal, { url })
  }

  /** # 退回 */
  async function goBack() {
    await AnyDialogHelper.showModel(RollBackModal, {
      source: 'reportAudit',
      sourceObjId: reportId,
      reportType,
    })
  }

  /** # 编辑复核审批意见 */
  function editApproval() {
    const openUrl = `reportController.do?goReportQuestionPage&reportId=${reportId}&sourceModule=2&reportPage=1`
    window.open(openUrl, '编辑复核审批意见')
  }

  /** # 通知修改委托 */
  async function noticeEntrust() {
    await AnyDialogHelper.showModel(NoticeModal, { type: '2', objectId: reportId })
  }

  /** # 记录追溯 */
  async function recordTrace() {
    const openUrl = `${location.origin}${import.meta.env.VITE_ILIS_BASE}/testTaskController.do?goTestTaskUdrContainer&id=${testTaskId}&udrReadOnly=1&defaultTabTitle=检测数据录入&page=task&reportId=${reportId}`
    await openHitekUdrTool(encodeURI(openUrl), 'max', true)
  }

  /** # 查询报告附件信息 */
  async function getReportFileAll() {
    const fileList: IReportFile[] = []
    const isOfflineReport = await isOfflineReportFun(testTaskId)
    if (isOfflineReport) {
      const { data } = await getOfflineReportFile()
      fileList.push({
        id: data?.id,
        dataType: '9',
        fileName: '线下出具报告',
      })
    }
    const { data } = await getReportFile(reportId)
    data?.obj?.forEach((i: any) => {
      fileList.push({
        id: i.id,
        dataType: i.type,
        name: i.name,
        code: i.code,
        fileName: i.fileName,
        fileid: i.reportFileId,
      })
    })
  }

  return {
    reportId,
    reportType,
    type,
    page,
    testTaskId,
    auditPass,
    goBack,
    editApproval,
    noticeEntrust,
    getReportFileAll,
    recordTrace,
  }
}
