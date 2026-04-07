import { z } from 'zod'
import { openTestTaskDetailPage } from '../openTestTaskDetailPage'
import { request } from '@/axios'
import { SystemParamService, SystemParamType } from '@/providers/services/SystemParamService'
import { TestTaskService } from '@/providers/services/TestTaskService'

const systemParamService = new SystemParamService()

/**
 * 提交报告前检查
 */
export function useBeforeSubmitReportCheckHook(testTaskId: string) {
  const testTaskService = new TestTaskService(testTaskId)

  const toastLoadingProp = {
    duration: 0,
    forbidClick: true,
    message: '数据校验中...',
  }

  // 提交报告前检查
  async function beforeBubmitReport() {
    // 检查试验任务的结论是否为不合格
    await checkUnqualifiedReport()

    // 检查设备填写情况
    await checkEquipmentInput()

    // 检查设备使用记录中使用时间填写情况
    await checkDeviceInputTime()
  }

  // 检查设备使用记录中使用时间填写情况
  async function checkDeviceInputTime(): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const toastLoading1 = showLoadingToast(toastLoadingProp)
      const res = await request({
        url: '/ilis2/rest/testTaskUseEquipmentController/getEquipUseRecordLackUseTime',
        method: 'POST',
        data: { testTaskId },
        schema: z.object({
          checkType: z.string(),
          useEquipments: z.array(z.any()),
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).finally(toastLoading1.close)

      if (res && res.useEquipments.length) {
        const { useEquipments, checkType } = res

        if (checkType === 'refuse_submit') {
          showDialog({
            title: '设备使用时间填写提醒',
            message: '存在使用时间未填写完整的设备使用记录，请填写完整后提交报告！',
          })
          reject(new Error('无法提交！'))
        }
        else {
          let message = '存在使用时间未填写完整的设备使用记录，是否继续提交报告？\r\n'

          useEquipments.forEach((i) => {
            message += `检查参数：${i.testParamDisplayName} 设备名称：${i.equipmentName}\r\n`
          })

          showConfirmDialog({
            title: '设备使用时间填写提醒',
            message,
            messageAlign: 'left',
            width: '460px',
          }).then(() => {
            resolve(true)
          }).catch(() => {
            reject(new Error('无法提交！'))
          })
        }
      }
      else {
        resolve(true)
      }
    })
  }

  // 检查设备填写情况
  async function checkEquipmentInput(): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const toastLoading1 = showLoadingToast(toastLoadingProp)
      const checkResult = await testTaskService.checkEquipmentRecordPower().finally(toastLoading1.close)
      if (!checkResult) {
        resolve(true)
        return
      }

      const toastLoading3 = showLoadingToast(toastLoadingProp)
      const c1 = await request({
        url: '/ilis2/testTaskController.do?getTestTaskParams',
        method: 'POST',
        data: { testTaskId },
        schema: z.object({
          success: z.boolean(),
          obj: z.array(z.any()),
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).finally(toastLoading3.close)

      const notEqList = c1.obj.filter(i => !i.equipments).map(i => i.displayName)

      if (notEqList.length) {
        showConfirmDialog({
          title: '无法提交',
          message: `本任务中检测参数：${notEqList.join(',')}，未选择设备，请选择设备后再次提交！`,
          cancelButtonText: '跳转网页版进行操作',
          messageAlign: 'left',
          cancelButtonColor: '#999',
          width: '460px',
        }).catch(() => {
          openTestTaskDetailPage(testTaskId)
        })
        reject(new Error('无法提交！'))
      }
      else {
        resolve(true)
      }
    })
  }

  // 检查试验任务的结论是否为不合格
  function checkUnqualifiedReport(): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const param = await systemParamService.getBusinessParam(SystemParamType['提交报告时，若试验任务不合格且未通过不合格上报时的提示策略'])

      if (param === 'NONE') {
        resolve(true)
        return
      }

      const toastLoading1 = showLoadingToast(toastLoadingProp)
      const c1 = await request({
        url: `/ilis2/rest/task/nonconformity/reports/is/qualified/${testTaskId}`,
        schema: z.number(),
      }).finally(toastLoading1.close)

      if (c1 !== 0 && c1 !== 3) {
        resolve(true)
        return
      }

      const toastLoading2 = showLoadingToast(toastLoadingProp)
      const c2 = await request({
        url: `rest/task/nonconformity/reports/list/${testTaskId}`,
        schema: z.object({
          code: z.number(),
          data: z.array(z.any()),
        }),
      }).finally(toastLoading2.close)

      const checkResult = c2.data.find(item => (item.status === 'PASS'))

      if (checkResult) {
        resolve(true)
        return
      }

      if (param === 'INFORM_NON_BLOCKING') {
        showConfirmDialog({
          title: '您正在提交不合格报告！',
          message: '当前试验任务的结论为不合格，您确定要提交报告吗？',
        }).then(() => {
          resolve(true)
        }).catch(() => {
          reject(new Error('无法提交！'))
        })
      }

      if (param === 'INFORM_BLOCKING') {
        showDialog({
          title: '无法提交报告！',
          message: '当前试验任务的结论为不合格，请上报不合格，审核通过后再次提交！',
        })

        reject(new Error('无法提交！'))
      }
    })
  }

  return {
    beforeBubmitReport,
  }
}
