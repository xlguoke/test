import { z } from 'zod'
import { h, ref } from 'vue'
import { Radio, RadioGroup, showSuccessToast } from 'vant'
import { request } from '@/axios'
import { SystemParamEnableType, SystemParamService, SystemParamType } from '@/providers/services/SystemParamService'
import type { TestReportService } from '@/providers/services/TestReportService'
import { ReportType } from '@/providers/services/TestReportService'

export class SubmitReportEntity {
  isFormalReport = ReportType.正式报告
  reviewDate?: string
  auditDate?: string
  signDate?: string
  reportOpinion = ''
  reportId: string | null = null
  testTaskId = ''
  ageDay?: string
  reportSn = ''
  defaultSn = ''
  attachmentIds: string[] = []
  attachments: Array<{ taskAttachmentId: string }> = []
  quaSave = 0
  reportSeals: any[] = []
  isQualified = ''
  verdict = ''
  verdictRemark = ''
  regulatoryId = ''
  reportTestTaskParamsId?: string[]
  signId?: string
}

const systemParamService = new SystemParamService()

/**
 * 提交报告
 */
export function useSubmitReportHook(testReportService: TestReportService) {
  const testTaskService = testReportService.testTaskService

  function loadingProp(message?: string) {
    return {
      duration: 0,
      forbidClick: true,
      message,
    }
  }

  /** 提交历史报告 */
  function submitReport(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 检查当前任务是否有设备记录权限
      const cerpLoading = showLoadingToast(loadingProp())
      const hasAuth = await testTaskService.checkEquipmentRecordPower().finally(cerpLoading.close)

      // 生成设备运行记录
      if (hasAuth) {
        const eorLoading = showLoadingToast(loadingProp())
        await testTaskService.equipmentOperationRecord().finally(eorLoading.close)
      }

      // word报告信息对比
      const wcLoading = showLoadingToast(loadingProp())
      await wordContrast(formData).finally(wcLoading.close)

      // 检查报告签发日期
      await checkReportSignDate(formData)

      // 检查是否存在临时报告并提醒
      if (formData.isFormalReport === ReportType.正式报告) {
        const ctrLoading = showLoadingToast(loadingProp())
        await checkTempReport().finally(ctrLoading.close)
      }

      // 检查报告文件是否包含了分报告但是没有报告文件
      await checkSubReport(formData)

      // 检查报告文件是否存在
      const crfLoading = showLoadingToast(loadingProp())
      await checkReportFile(formData).finally(crfLoading.close)

      // 构建提交数据
      await setFormData(formData)

      // 获取报告匹配的监管系统
      formData.regulatoryId = await getReportSupervisorySystem()

      const submitLoading = showLoadingToast(loadingProp('提交中...'))
      const res = await request({
        url: '/ilis2/testTaskReportController.do?doSubmitReport',
        method: 'POST',
        data: formData,
        headers: {
          industryid: '8a8ab0b246dc81120146dc8180dd001e',
        },
        schema: z.object({
          success: z.boolean(),
          obj: z.any().nullable(),
          msg: z.string(),
        }),
      }).finally(submitLoading.close)

      if (res.success)
        resolve(true)
      else
        reject(new Error(res.msg))
    })
  }

  /**
   * 提交新报告
   * 和提交报告差不多，但分开逻辑好梳理一点
   */
  function submitNewReport(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 检查检测结论是否合格
      await checkIsQualified()

      // 检查当前任务是否有设备记录权限
      const cerpLoading = showLoadingToast(loadingProp())
      const hasAuth = await testTaskService.checkEquipmentRecordPower().finally(cerpLoading.close)

      // 生成设备运行记录
      if (hasAuth) {
        const eorLoading = showLoadingToast(loadingProp())
        await testTaskService.equipmentOperationRecord().finally(eorLoading.close)
      }

      // word报告信息对比
      const wcLoading = showLoadingToast(loadingProp())
      await wordContrast(formData).finally(wcLoading.close)

      // pdf流转
      const isPDFRoam = await systemParamService.getBusinessParam(SystemParamType.审核批准时查看记录报告的方式) === 'pdf'

      // 检查是否是线下出具报告
      const isOfflineReport = await testReportService.testTaskService.checkIsOfflineReport()

      if (isPDFRoam) {
        // 报告转为PDF保存确认
        await generatePDFConfirm()
      }

      // 检查报告签发日期
      await checkReportSignDate(formData)

      // 检查报告文件是否包含了分报告但是没有报告文件
      await checkSubReport(formData)

      // 检查报告文件是否存在
      const crfLoading = showLoadingToast(loadingProp())
      await checkReportFile(formData).finally(crfLoading.close)

      await setFormData(formData)

      if (formData.isFormalReport === ReportType.临时报告)
        await checkReportTestTaskParamsId(formData)

      // 获取报告匹配的监管系统
      formData.regulatoryId = await getReportSupervisorySystem()

      const submitLoading = showLoadingToast(loadingProp('提交中...'))
      const res = await request({
        url: isOfflineReport ? '/ilis2/testTaskReportController.do?doSubmitReport' : '/ilis2/testTaskReportController.do?doSaveReport',
        method: 'POST',
        data: formData,
        headers: {
          industryid: '8a8ab0b246dc81120146dc8180dd001e',
        },
        schema: z.object({
          success: z.boolean(),
          obj: z.any().nullable(),
          msg: z.string(),
        }),
      }).finally(submitLoading.close)

      if (res.success)
        resolve(true)
      else
        reject(new Error(res.msg))
    })
  }

  /** PDF模式 确认提交报告 */
  async function submitPdfReport(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      await checkAutoIsQualified()

      // 检查当前任务是否有设备记录权限
      const cerpLoading = showLoadingToast(loadingProp())
      const hasAuth = await testTaskService.checkEquipmentRecordPower().finally(cerpLoading.close)

      // 生成设备运行记录
      if (hasAuth) {
        const eorLoading = showLoadingToast(loadingProp())
        await testTaskService.equipmentOperationRecord().finally(eorLoading.close)
      }

      // word报告信息对比
      const wcLoading = showLoadingToast(loadingProp())
      await wordContrast(formData).finally(wcLoading.close)

      // 获取报告匹配的监管系统
      formData.regulatoryId = await getReportSupervisorySystem()

      await beforeSubmitValidation()

      const submitLoading = showLoadingToast(loadingProp('提交中...'))
      const res = await request({
        url: '/ilis2/testTaskReportController.do?submitReportById',
        method: 'POST',
        data: {
          reportId: testReportService.reportId,
          testTaskId: testReportService.testTaskId,
          regulatoryId: formData.regulatoryId,
          reportOpinion: formData.reportOpinion,
          signId: formData.signId,
        },
        headers: {
          industryid: '8a8ab0b246dc81120146dc8180dd001e',
        },
      }).finally(submitLoading.close) as any

      if (!res || res.success || res.code === 20000)
        resolve(true)
      else
        reject(new Error(res.msg))
    })
  }

  /** PDF模式 确认提交报告 - 签字 */
  async function submitPdfSign(formData: SubmitReportEntity) {
    const signData = await checkPdfSign(formData)

    // 诚信签
    if (signData && signData.signServer === 'creditSign')
      await runCreditSign()

    const r = await submitPdfReport(formData)

    return r
  }

  /** 报告 不同意提交 */
  async function disagreeSubmitReport(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const submitLoading = showLoadingToast(loadingProp('处理中...'))
      const res = await request({
        url: '/ilis2/testTaskReportController.do?doSubmitReportDisagree',
        method: 'POST',
        data: {
          reportId: testReportService.reportId,
          comment: formData.reportOpinion,
        },
        headers: {
          'industryid': '8a8ab0b246dc81120146dc8180dd001e',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        schema: z.object({
          success: z.boolean(),
          obj: z.any().nullable(),
          msg: z.string(),
        }),
      }).finally(submitLoading.close)

      if (res.success)
        resolve(true)
      else
        reject(new Error(res.msg))
    })
  }

  /** word报告信息对比 */
  async function wordContrast(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // 判断该任务对应的委托是否为现场检测委托
      const isFieldExperiment = await testTaskService.checkIsFieldExperiment()
      // 是否开启对比参数
      let enableParam = false
      // 报告文件是否含有word文件
      let includeWord = false
      let roundType = ''
      let regulatoryId = ''

      // 如果是现场检测委托则判断是否开启了对比参数
      if (isFieldExperiment) {
        enableParam = await testReportService.checkWordContrastBusinessParam()

        // 是现场检测委托又开启了设对比参数就判断当前任务对应的报告文件是否含有word文件
        if (enableParam)
          includeWord = await testReportService.checkScheduleAttachmentType(formData.attachmentIds)
      }

      if (!testReportService.isNewReport) {
        const report = await testReportService.getReportInfo()
        roundType = report.roundType
        regulatoryId = report.regulatoryId
      }

      // 没有开启控制参数，不是现场检测，任务下的报告文件没有word文档,或者报告流转方式是pdf 都不进行设备对比
      if (!isFieldExperiment || !enableParam || !includeWord || roundType === 'pdf')
        resolve(regulatoryId)
        // return
    })
  }

  /** 检查报告签发日期 */
  async function checkReportSignDate(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (formData.signDate && new Date(formData.signDate).getTime() > new Date().getTime()) {
        const loading = showLoadingToast(loadingProp())
        const param = await systemParamService.getBusinessParam(SystemParamType['设置报告签发日期时，不可选择超过当前日期']).finally(loading.close)

        if (param === SystemParamEnableType.开启) {
          showDialog({
            title: '提示',
            message: '您当前设置的签发日期大于当前日期，根据系统设置，无法提交，请重新设置！',
          })
        }
        else {
          showConfirmDialog({
            title: '提示',
            message: '您当前设置的签发日期大于当前日期，您确定要继续提交吗？',
          }).then(() => {
            resolve(true)
          }).catch(() => {
            reject(new Error('取消提交！'))
          })
        }
      }
      else {
        resolve(true)
      }
    })
  }

  /** 检查是否存在临时报告并提醒 */
  async function checkTempReport() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 查询是否存在临时报告
      const rows = await testReportService.getTempReport()

      if (rows.length > 0) {
        showConfirmDialog({
          title: '提示',
          message: '您当前所选为正式报告，系统将结束未完成的临时报告提交流程，是否继续？',
        }).then(() => {
          resolve(true)
        }).catch(() => {
          reject(new Error('取消提交！'))
        })
      }
      else {
        resolve(true)
      }
    })
  }

  /** 检查报告文件是否包含了分报告但是没有报告文件 */
  async function checkSubReport(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 任务报告文件
      const attachmentList = await testTaskService.getAttachments()

      // 报告文件判断，不能单独选择分报告文件进行报告提交
      const attachments = attachmentList.filter(i => formData.attachmentIds.includes(i.id))
      const hasReportFile = attachments.some(i => i.use_type === '1')
      const hasSubReportFile = attachments.some(i => i.use_type === '7')

      if (hasSubReportFile && !hasReportFile) {
        showDialog({
          title: '提示',
          message: '选择【分报告】时，请至少选择一份【报告文件】！',
        })
        reject(new Error('无法提交！'))
      }
      else {
        resolve(true)
      }
    })
  }

  /** 检查报告文件是否存在 */
  async function checkReportFile(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 报告提交，检查报告是否存在
      const attachmentIds = formData.attachmentIds

      // 检查是否是线下出具报告
      const isOfflineReport = await testReportService.testTaskService.checkIsOfflineReport()

      if (!attachmentIds.length && !isOfflineReport) {
        showDialog({
          title: '提示',
          message: '请选择报告文件！',
        })
        reject(new Error('无法提交！'))
      }
      else {
        resolve(true)
      }
    })
  }

  /** 获取报告匹配的监管系统 */
  async function getReportSupervisorySystem(): Promise<string> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const taskData = await testTaskService.getTaskDetail()
      const isOfflineReport = await testReportService.testTaskService.checkIsOfflineReport()

      const loading = showLoadingToast(loadingProp())
      const data = await request({
        method: 'POST',
        url: '/ilis2/rest/regulatory/report',
        data: [{ consignInfoId: taskData.consignInfo.id }],
      }).finally(loading.close) as Record<string, any>

      const keys = Object.keys(data)
      const noData = !data || !keys.length

      if (noData || isOfflineReport) {
        resolve('')
        return
      }

      for (const key in data) {
        const list = data[key]

        if (list.length === 0) {
          resolve('')
          return
        }

        if (list.length === 1) {
          resolve(list[0].id || '')
          return
        }

        if (list.length > 1) {
          const checked = ref('1')

          if (list.length) {
            showConfirmDialog({
              title: '请选择确认防伪码信息',
              message: () => h('div', { class: 'radio-group' }, [
                h('p', {
                  style: 'margin-bottom: 8px;',
                }, '该报告同时满足多个监管系统的上报范围，且都需要自动添加防伪码，请您确认使用哪个监管系统的防伪码：'),
                h(RadioGroup, {
                  'style': 'display: flex;flex-direction: column;gap: 8px;',
                  'modelValue': checked.value,
                  'onUpdate:modelValue': (value) => {
                    checked.value = value
                  },
                }, [
                  ...list.map((item: any) => (
                    h(Radio, {
                      name: item.id,
                    }, item.name)
                  )),
                ]),
              ]),
            }).then(() => {
              resolve(checked.value || '')
            }).catch(() => {
              reject(new Error('取消提交！'))
            })
          }
        }
      }
    })
  }

  /** 检查检测结论是否合格 */
  async function checkIsQualified() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const reportDetail = await testReportService.getReportDetail()
      // pdf流转
      const isPDFRoam = await systemParamService.getBusinessParam(SystemParamType.审核批准时查看记录报告的方式) === 'pdf'

      if (reportDetail?.autoIsQualified === 0 && !isPDFRoam) {
        showConfirmDialog({
          title: '提示',
          message: '当前任务检测不合格，是否继续提交报告？',
        }).then(() => {
          resolve(true)
        }).catch(() => {
          reject(new Error('取消提交！'))
        })
      }
      else {
        resolve(true)
      }
    })
  }

  /** 检查任务检测是否合格 */
  async function checkAutoIsQualified() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const reportInfo = await testReportService.getReportInfo()

      if (reportInfo.autoIsQualified !== 0) {
        resolve(true)
        return
      }

      showConfirmDialog({
        title: '提示',
        message: '当前任务检测不合格，是否继续提交报告？',
      }).then(() => {
        resolve(true)
      }).catch(() => {
        reject(new Error('取消提交！'))
      })
    })
  }

  /** 报告确认前验证 */
  async function beforeSubmitValidation() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const tLoading = showLoadingToast({
        duration: 0,
        message: '验证中...',
        forbidClick: true,
      })
      const data = await request({
        url: '/ilis2/testTaskReportController.do?checkReportTaskDifference',
        params: {
          reportId: testReportService.reportId,
          taskId: testReportService.testTaskId,
        },
      }).finally(tLoading.close) as any

      if (data.personDifference) {
        showConfirmDialog({
          title: '提示',
          message: `${data.personDifference}，若不需要修改，请点击继续提交；若需要修改，请点击取消后，返回报告列表点击修改，重新设置报告人员`,
          confirmButtonText: '继续提交',
        }).then(() => {
          resolve(true)
        }).catch(() => {
          reject(new Error('取消提交！'))
        })
      }
      else {
        resolve(true)
      }
    })
  }

  /** 报告转为PDF保存确认 */
  async function generatePDFConfirm() {
    return new Promise((resolve, reject) => {
      showConfirmDialog({
        title: '提示',
        message: '确认保存后，报告将转为PDF文件，如果仅报告文件内容有<span style="color:red;font-weight: 900;font-size: 14px;">更新</span>，请使用<span style="color:red;font-weight: 900;font-size: 14px;">重新转换</span>功能更新报告文件；如果需<span style="color:red;font-weight: 900;font-size: 14px;">更换</span>报告文件或<span style="color:red;font-weight: 900;font-size: 14px;">重新设置</span>人员、资质签发日期等信息，请使用<span style="color:red;font-weight: 900;font-size: 14px;">修改</span>功能重新设置并生成PDF文件！',
        allowHtml: true,
        messageAlign: 'left',
      }).then(() => {
        resolve(true)
      }).catch(() => {
        reject(new Error('取消提交！'))
      })
    })
  }

  /** 检查并设置报告参数 */
  async function checkReportTestTaskParamsId(formData: SubmitReportEntity) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const taskDetail = await testTaskService.getTaskDetail()

      if (!taskDetail.testTaskParams.length) {
        showDialog({
          title: '提示',
          message: `
            <p>请选择报告参数！</p>
            <p style="color: #999;margin-top: 8px;">可跳转网页版进行操作</p>
          `,
          messageAlign: 'left',
        })
        reject(new Error('无法提交！'))
      }
      else {
        formData.reportTestTaskParamsId = taskDetail.testTaskParams.map(i => i.id)
        resolve(true)
      }
    })
  }

  /** PDF签字检查 */
  async function checkPdfSign(formData: SubmitReportEntity): Promise<null | { signServer: string }> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const loading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await request({
        url: '/ilis2/rest/signer/process/sign/construct',
        method: 'post',
        data: {
          reportsId: [testReportService.reportId],
          signType: 'test',
        },
      }).finally(loading.close) as any

      const signingInfoData = res

      if (!signingInfoData) {
        resolve(signingInfoData)
        return
      }

      formData.signId = signingInfoData.signId || null

      // 诚信签，需要短信验证码
      if (signingInfoData.signServer === 'creditSign') {
        resolve(signingInfoData)
        return
      }

      if (!signingInfoData.filesSignInfos || !signingInfoData.filesSignInfos.length) {
        resolve(signingInfoData)
        return
      }

      reject(new Error('无法提交！'))

      showDialog({
        title: '提示',
        message: '当前电子签名为Ukey模式，移动端无法完成电子签名，请前往PC端提交报告！',
      })
    })
  }

  /** 诚信签 短信验证 */
  function runCreditSign() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const code = ref('')

      showConfirmDialog({
        title: '短信验证码已发送至您手机，请注意查收',
        message: () => (h('div', {
          style: 'padding: 16px;',
        }, [
          h('input', {
            style: 'width: 100%;height: 32px;padding: 0 8px;border: solid 1px #e2e2e2;border-radius: 4px;',
            value: code.value,
            onInput: (e: any) => {
              code.value = e.target.value
            },
          }),
        ])),
      }).then(async () => {
        const sLoading = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        const res = await request({
          url: '/ilis2/rest/signer/getSignProcess',
          method: 'POST',
          data: {
            reportIds: testReportService.reportId,
            authCode: code.value,
            signType: 'test',
          },
        }).finally(sLoading.close) as any

        if (res && res.serverType === 'baseSign') {
          // showDialog({
          //   title: '提示',
          //   message: '当前电子签名为Ukey模式，移动端无法完成电子签名，请前往PC端提交报告！',
          // })
          reject(new Error('无法提交！'))
        }
        else if (res && res.nearOverdue && res.validDate) {
          // showDialog({
          //   title: '提示',
          //   message: `签名成功!您的个人电子印章有效期至${res.validDate}，请及时联系管理员处理。`,
          // })
          resolve(true)
        }
        else {
          showSuccessToast('签字成功')
          resolve(true)
        }
      }).catch(() => {
        reject(new Error('取消提交！'))
      })
    })
  }

  /** 构建提交数据 */
  async function setFormData(formData: SubmitReportEntity) {
    const reportDetail = await testReportService.getReportDetail()

    formData.reportId = testReportService.reportId || null
    formData.testTaskId = testReportService.testTaskId
    formData.attachments = formData.attachmentIds.map(id => ({ taskAttachmentId: id }))
    formData.reportSn = reportDetail?.snStr
    formData.defaultSn = reportDetail?.snStr
    formData.quaSave = 0
    formData.isQualified = reportDetail?.verdict.isQualified || ''
    formData.verdict = ''
    formData.verdictRemark = ''
  }

  return {
    submitReport,
    submitNewReport,
    disagreeSubmitReport,

    submitPdfSign,
    submitPdfReport,
  }
}
