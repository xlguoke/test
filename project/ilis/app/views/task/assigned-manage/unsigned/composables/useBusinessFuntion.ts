import type { TaskUnAssignedManageEntity } from '../TaskUnAssignedManageEntity'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import RollBackModal from '~/components/ilisComponent/rollback/RollBackModal.vue'
import { useIndustryStore } from '~/store/industryStore'
import { systemPrintTemplateApi } from '../../signed/api'

// 按样品分配
const objectPageUrl = 'unAssignedTaskController.do?goAllotByObjectPage'
// 按参数分配
const paramPageUrl = 'unAssignedTaskController.do?goAllotByParamPage'

/** # 分配任务 */
export function handleAssignTask(rows: TaskUnAssignedManageEntity[]) {
  if (!rows?.length) {
    message.warning('请选择任务')
    return
  }

  const { industryId } = useIndustryStore()

  let url = `${objectPageUrl}&industryId=${industryId}`
  if (rows.length === 1 && rows[0].taskAssignType === '1') {
    url = `${paramPageUrl}&industryId=${industryId}`
  }

  // 按参数分配的
  const signedByParamSamples = rows.filter(i => i.taskAssignType === '1')

  if (signedByParamSamples?.length && rows.length > 1) {
    Modal.confirm({
      title: '提示',
      centered: true,
      content: () => {
        return h('div', {}, [...signedByParamSamples.map((i) => {
          return h('div', {}, `${i.testObjectCode} ${i.testSampleDisplayName} ${i.standard}`)
        }), h('div', {}, '退回前是按参数分配方式，若改为按样品方式分配，将只保留一个任务，多余的任务将自动删除，是否继续？')])
      },
      onOk: () => {
        topOpenLayer(url)
      },
    })
    return
  }
  topOpenLayer(url)
}

function topOpenLayer(openUrl: string) {
  window?.top?.layer?.open({
    title: '任务分配',
    skin: 'mylayui-layer-molv',
    type: 2,
    content: openUrl,
    btn: ['确定', '取消'],
    area: ['90%', '90%'],
    maxmin: true,
    yes(index: number) {
      const iframeWin = window?.top?.window[`layui-layer-iframe${index}`]
      iframeWin?.submitAssign()
    },
  })
}

/** # 单独分配样品 */
window.batchAssignTask2 = function (row: any) {
  const { industryId } = useIndustryStore()
  window?.top?.layer?.closeAll()
  // 有row时为单独分配
  const openUrl = `unAssignedTaskController.do?goAllotByObjectPage&industryId=${industryId}&record=${row}`
  topOpenLayer(openUrl)
}

/** # 退回 */
export async function handleReturnTask(rows: TaskUnAssignedManageEntity[]) {
  if (rows?.length !== 1) {
    message.warning('请选择一个样品')
    return
  }
  await AnyDialogHelper.showModel(RollBackModal, {
    source: 'taskAssign',
    sourceObjId: rows[0].sampleId,
  })
}

/** # 分包登记 */
export async function handleSubpackageTask(rows: TaskUnAssignedManageEntity[], callback?: (res?: any) => void) {
  const cacheKey = await setServerCacheData({ data: rows })
  const { industryId } = useIndustryStore()
  const url = `subcontractController.do?goSubcontractList&industryId=${industryId}&taskassigned=taskassigned&id=${cacheKey}`
  window?.top?.layer?.open({
    type: 2,
    title: '分包登记',
    skin: 'mylayui-layer-molv',
    area: ['80%', '80%'],
    btn: ['确定', '取消'],
    content: url,
    yes(_index: number, layero: any) {
      const iframeWin = layero.find('iframe')[0].contentWindow
      iframeWin?.layerOkCallback((res: any) => {
        callback?.()
        top?.layer.closeAll()
        if (res && res.code === 20000) {
          message.success('操作成功')
          if (res.data.length) {
            IlisPrintUdr.commonPrint(res.data, 'SubcontractInfo')
          }
        }
      })
    },
  })
}

/** # 打印检测工作通知单 */
export async function handlePrintTaskNotice(rows: TaskUnAssignedManageEntity[]) {
  if (!rows?.length) {
    message.warning('请选择数据')
    return
  }
  if (rows.some(i => !i.departmentId)) {
    message.warning('所选中包含有未指定部门的数据，请重新选择')
    return
  }
  const ids = rows.map(i => i.sampleId)

  const { data } = await systemPrintTemplateApi('InspectionNotice')
  IlisPrintUdr.commonPrint(ids, data)
}
