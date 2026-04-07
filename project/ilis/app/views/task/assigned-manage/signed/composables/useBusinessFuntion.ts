import type { TaskAssignedManageEntity } from '../TaskAssignedManageEntity'
import { message } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { systemPrintTemplateApi } from '../api'

/** # 打印检测工作通知单 */
export async function handlePrintTaskNotice(rows: TaskAssignedManageEntity[]) {
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

/** # 打印任务分配单 */
export function handlePrintTask(rows: TaskAssignedManageEntity[]) {
  if (!rows?.length) {
    message.warning('请选择数据')
    return
  }
  const ids = rows.map(i => i.testTaskId!)
  IlisPrintUdr.commonPrint(ids, 'taskDistribution')
}

/** # 打印任务分配单（合并为一个单据） */
export function handlePrintTaskByMerge(rows: TaskAssignedManageEntity[]) {
  if (!rows?.length) {
    message.warning('请选择数据')
    return
  }
  const ids = rows.map(i => i.testTaskId!)
  IlisPrintUdr.commonPrint(ids, 'TestDistributionMerge', {
    multiple: 'true',
  })
}

/** # 导出（由于返回无标准头文件流，只能手动处理文件流） */
export async function exportXls(params: Record<string, any>) {
  const res = await IlisApiHelper.get('assignedTaskController.do?exportXls', params, {
    responseType: 'blob',
  })
  await downloader.excute(res.data as Blob, '已分配任务清单.xlsx')
  message.success('导出成功')
}

export function handleBatchReallocate(rows: TaskAssignedManageEntity[], callBack: () => void) {
  if (!rows?.length) {
    message.warning('请选择数据')
    return
  }
  const testTaskIds = rows.map(i => i.testTaskId)?.join(',')
  const testObjectIds = rows.map(i => i.sampleId)?.join(',')
  const consignIds = rows.map(i => i.consignId)?.join(',')
  const { industryId } = useIndustryStore()
  top?.layer.open({
    type: 2,
    title: '批量重新任务分配',
    skin: 'mylayui-layer-molv',
    area: ['750px', '550px'],
    btn: ['确定', '取消'],
    content: `view.do?page=batchAllocation&type=testTask&testObjectIds=${testObjectIds}&testTaskIds=${testTaskIds}&consignIds=${consignIds}&industryId=${industryId}`,
    yes(index: number) {
      const iframeWin = top?.[`layui-layer-iframe${index}`]
      iframeWin?.resetAssignee(() => {
        top?.layer.close(index)
        callBack?.()
      })
    },
  })
}

/** # 重新分配 */
export function handleReAssignTask(row: TaskAssignedManageEntity, callBack: () => void) {
  if (!row?.testTaskId) {
    message.warning('请选择数据')
    return
  }
  const { industryId } = useIndustryStore()
  const openUrl = `assignedTaskController.do?goReAssignPage&testTaskId=${row.testTaskId}&industryId=${industryId}`
  top?.layer.open({
    title: '任务重新分配',
    skin: 'mylayui-layer-molv',
    type: 2,
    content: openUrl,
    btn: ['确定', '取消'],
    area: ['90%', '90%'],
    maxmin: true,
    yes(index: number) {
      const iframeWin = top?.window[`layui-layer-iframe${index}`]
      if (iframeWin?.datalayerConfirm) {
        const res = iframeWin.datalayerConfirm()
        if (res?.persons) {
          const msg = `当前任务是按参数分配且合并出报告的任务，修改 ${res.persons} 会同步修改另一个参数任务的 ${res.persons}`
          top?.layerConfirm(msg, { title: '提示' }, (index2: number) => {
            iframeWin.submitAssign()
            // top?.layer.close(index)
            top?.layer.close(index2)
            callBack?.()
          })
        }
      }
    },
  })
}
