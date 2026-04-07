import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import RollBackModal from '~/components/ilisComponent/rollback/RollBackModal.vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { getOfflineReportFile, getReportFile, isOfflineReportFun } from '../api'
import ApprovePassModal from '../components/ApprovePassModal.vue'
import NoticeModal from '../components/NoticeModal.vue'
/** # 报告状态 */
export enum EReportStatus {
  /** # 已提交/预提交 */
  SUBMITTED = '9',
  /** # 未审批 */
  PRE_APPROVED = '10',
  /** # 复核通过 */
  RECHECK_PASSED = '15',
  /** # 审核通过 */
  APPROVED = '20',
  /** # 批准通过 */
  APPROVED_PASSED = '30',
}

interface IReportFile {
  id: string
  dataType: string
  name?: string
  code?: string
  fileid?: string
  fileName?: string
  status?: string
}

export function useReportApprove() {
  const urlParams = new URLSearchParams(window.location.search)
  const reportId = urlParams.get('reportId') || ''
  const reportType = urlParams.get('reportType') || ''
  const testTaskId = urlParams.get('testTaskId') || ''
  const reportStatus: EReportStatus | null = urlParams.get('reportStatus') as EReportStatus || null
  const approveStatus = urlParams.get('approveStatus') // tabs类型

  /** # 批准通过 */
  async function auditPass() {
    const isWaitSignReport = urlParams.get('isWaitSignReport') || ''
    const eleSignDateType = urlParams.get('eleSignDateType') || ''
    const url = `reportApproveController.do?goReportApprovePass&reportIds=${reportId}&detailPass=detailPass&circulationType=3&isWaitSignReport=${isWaitSignReport}&eleSignDateType=${eleSignDateType}`
    await AnyDialogHelper.showModel(ApprovePassModal, { url })
  }

  /** # 退回 */
  async function goBack() {
    await AnyDialogHelper.showModel(RollBackModal, {
      source: 'reportApprove',
      sourceObjId: reportId,
      reportType,
    })
  }

  /** # 查看检测详情 */
  async function goDetail() {
    if (reportType === 'synthesis' || reportType === 'synthesis_temp' || reportType === 'synthesis_Temp') {
    // 综合报告 查看检测详情即打开报告编制中的报告详情
      const url = 'reportCreateController.do?goEditPage&detectionDetail=detectionDetail'
      const openUrl = `${url}&reportId=${reportId}&detail=detailPage`
      window.open(openUrl, '报告详情')
      return
    }
    if (reportType.includes('synthesis')) {
      window.open('reportCreateController.do?goEditPage', '检测详情')
    }
    const { data } = await IlisApiHelper.postForm<{ obj: string[] }>('reportAuditController.do?getTaskIds', { reportId })
    const arr = data.obj
    if (arr?.length > 1) {
    // 综合报告
      window.open('reportCreateController.do?goEditPage', '检测详情')
    }
    else {
    // 原材料报告
      const url = 'testTaskController.do?goTestTaskDetail'
      let openUrl = `${url}&id=${arr[0]}&reportId=${reportId}&readType=2&udrReadOnly=1`
      openUrl += `&rid=${reportId}`
      window.open(openUrl, '检测详情')
    }
  }

  /** # 编辑复核审批意见 */
  function editApproval() {
    const openUrl = `reportController.do?goReportQuestionPage&reportId=${reportId}&sourceModule=3`
    window.open(openUrl, '编辑复核审批意见')
  }

  /** # 通知修改委托 */
  async function noticeEntrust() {
    await AnyDialogHelper.showModel(NoticeModal, { type: '3', objectId: reportId })
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
    reportStatus,
    approveStatus,
    testTaskId,
    auditPass,
    goBack,
    goDetail,
    editApproval,
    noticeEntrust,
    getReportFileAll,
  }
}
