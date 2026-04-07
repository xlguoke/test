import type { ReportCompiledEntity } from '../ReportCompiledEntity'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { cancelInvalidReport, checkEditPermission, invalidReport, updateReportNumber } from '../api'
import Detail from '../component/Detail.vue'
import { EReportCompiledType } from '../ReportCompiledEntity'

/** # 新增、编辑、详情 地址 */
const editPageUrl = 'reportCreateController.do?goEditPage'

/** # 创建报告 */
export function handleCreate() {
  window.open(editPageUrl)
}

/** # 显示编辑警告弹窗 */
export function showEditWarningModal() {
  Modal.warning({
    title: '提示',
    centered: true,
    content: '检测报告请相关人员移步试验检测模块进行修改等处理',
  })
}

/** # 显示编辑权限警告弹窗 */
export function showEditPermissionWarningModal() {
  Modal.warning({
    title: '提示',
    centered: true,
    content: '抱歉,你没有该报告的操作权限',
  })
}

/** # 检查报告类型是否为综合报告或综合报告的临时报告 */
export function checkReportType(record: ReportCompiledEntity): boolean {
  if (record.reportType === EReportCompiledType.SYNTHESIS || record.reportType === EReportCompiledType.SYNTHESIS_TEMP) {
    return true
  }
  return false
}

/** # 检查报告是否为正式报告 */
export function checkFormalReport(record: ReportCompiledEntity): boolean {
  if (record.reportType === EReportCompiledType.FORMAL || record.reportType === EReportCompiledType.SYNTHESIS) {
    return true
  }
  return false
}

/** # 编辑报告 */
export async function handleEdit(record: ReportCompiledEntity) {
  if (!checkReportType(record)) {
    showEditWarningModal()
    return
  }
  const canEdit = await checkEditPermission(record)
  if (!canEdit) {
    showEditPermissionWarningModal()
    return
  }
  window.open(`${editPageUrl}&reportId=${record.id}`)
}

/** # 查看报告 */
export function handleDetail(record: ReportCompiledEntity) {
  // console.log('查看报告', record)
  AnyDialogHelper.showModel(Detail, {
    url: `${editPageUrl}&reportId=${record.id}&detail=detailPage`,
  })
}

/** # 修改报告编号 */
export async function handleChangeReportSn(record: ReportCompiledEntity) {
  if (!checkReportType(record)) {
    showEditWarningModal()
    return
  }
  const canEdit = await checkEditPermission(record)
  if (!canEdit) {
    showEditPermissionWarningModal()
    return
  }
  const res = await AnyDialogHelper.showPrompt({
    title: '请输入新编号',
    required: true,
    initData: record.reportSn,
  })
  await updateReportNumber(record, res)
  message.success('修改成功')
}

/** # 作废报告 */
export async function handleInvalid(record: ReportCompiledEntity) {
  if (!checkReportType(record)) {
    showEditWarningModal()
    return
  }
  const res = await AnyDialogHelper.showPrompt({
    title: '请输入作废原因',
    required: true,
  })
  await invalidReport(record, res)
  message.success('操作成功')
}

/** # 取消作废报告 */
export async function handleCancelInvalid(record: ReportCompiledEntity, callback: () => void) {
  if (!checkReportType(record)) {
    showEditWarningModal()
    return
  }
  Modal.confirm({
    title: '提示',
    centered: true,
    content: '是否将当前报告取消作废?',
    onOk: async () => {
      await cancelInvalidReport(record)
      message.success('操作成功')
      callback()
    },
  })
}

/** # 添加临时报告 */
export async function handleAddTemp(record: ReportCompiledEntity) {
  if (!checkReportType(record)) {
    showEditWarningModal()
    return
  }
  if (!checkFormalReport(record)) {
    Modal.warning({
      title: '提示',
      centered: true,
      content: '请选择正式报告来创建关联临时报告',
    })
    return
  }
  const canEdit = await checkEditPermission(record)
  if (!canEdit) {
    showEditPermissionWarningModal()
    return
  }
  window.open(`${editPageUrl}&formalId=${record.id}`)
}
