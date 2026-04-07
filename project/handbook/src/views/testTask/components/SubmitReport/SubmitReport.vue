<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { z } from 'zod'
import { Checkbox, CheckboxGroup, showSuccessToast } from 'vant'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { ReportDetail } from '../../../../../packages/custodian/src/types/report'
import { openTestTaskDetailPage } from '../openTestTaskDetailPage'
import { SubmitReportEntity, useSubmitReportHook } from './useSubmitReportHook'
import FormItemDate from '@/components/FormItem/FormItemDate.vue'
import { ReportPersonType, ReportType, TestReportService, isQualifiedEnum } from '@/providers/services/TestReportService'
import { SystemParamEnableType, SystemParamService, SystemParamType } from '@/providers/services/SystemParamService'
import { request } from '@/axios'
import { formatDate } from '@/utils'
import type { TestTaskAttachmentDTO } from '@/providers/services/TestTaskService'

const porps = defineProps({
  testTaskId: String,
  reportId: String,
})

const router = useRouter()

const testTaskId = computed(() => porps.testTaskId || '')

const reportId = computed(() => porps.reportId || '')

const systemParamService = new SystemParamService()

const testReportService = new TestReportService(testTaskId.value, reportId.value)

const {
  submitReport,
  submitNewReport,
  disagreeSubmitReport,
} = useSubmitReportHook(testReportService)

const formData = ref(new SubmitReportEntity())

/** 报告详情 */
const reportDetail = ref<ReportDetail>()

/** 详情信息 */
const viewData = ref({
  sealNames: '',
  qualificationNames: '',
  testResult: '',
  reportSn: '',
  testDate: '',
  testConditions: '',
})

// 附件列表
const attachmentList = ref<TestTaskAttachmentDTO[]>([])

// 是否新报告
const isNewReport = ref(!reportId.value)

// 是否AB报告
const isABReport = computed(() => (reportDetail.value?.ABReports || []).length > 0)

// 禁用切换报告类型
const reportTypeDisabled = ref(false)

// 报告签发日期必填
const isRequireSignDate = ref(false)

// 报告复核日期必填
const isRequireReviewDate = ref(false)

// 是否PDF流转
const isPDFRoam = ref(false)

// 展开更多
const expandMoreUser = ref(false)

// 展示复核日期
const showReviewDate = ref(false)

// 展示审核日期
const showAuditDate = ref(false)

// 展示签发日期
const showSignDate = ref(false)

// 已选文件
const reportFileText = computed(() => {
  const a = attachmentList.value.filter(i => formData.value.attachmentIds.includes(i.id))
  return a.map(i => i.name).join('；')
})

const infoFieldAttr = {
  labelWidth: '110px',
  labelAlign: 'right',
  readonly: true,
  type: 'textarea',
  rows: 1,
  autosize: true,
} as any

const fieldAttr = {
  labelWidth: '110px',
  labelAlign: 'right',
} as any

function person(type: ReportPersonType) {
  return (reportDetail.value?.listPerson || []).filter(i => i.type === type).map(i => i.realname).join('；')
}

/** 检查资质参数 */
async function checkQualification() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const qualificationIds: string[] = []

    reportDetail.value?.qualificationTypes.forEach((q) => {
      if (!qualificationIds.includes(q.qualificationId))
        qualificationIds.push(q.qualificationId)
    })

    const cqLoading = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '加载中...',
    })
    const message = await request({
      url: '/ilis2/reportController.do?checkClashQualificationOfTask',
      method: 'GET',
      params: {
        taskIds: testTaskId.value,
        qualificationIds: qualificationIds.join(','),
      },
      schema: z.string(),
    }).finally(cqLoading.close)

    if (!message) {
      resolve(true)
      return
    }

    const param = await systemParamService.getBusinessParam(SystemParamType['报告设置资质章时，资质对应报告参数'])

    const tip = `${message}<p style="color: #999;margin-top: 8px;">若要修改报告印章，可跳转网页版进行操作</p>`

    if (param === 'ALLCOVER') {
      showDialog({
        title: '提示',
        message: tip,
        width: '460px',
        allowHtml: true,
        confirmButtonText: '关闭',
        messageAlign: 'left',
      })
      resolve(true)
    }
    else {
      showConfirmDialog({
        title: '提示',
        message: tip,
        width: '460px',
        allowHtml: true,
        messageAlign: 'left',
      }).then(() => {
        formData.value.reportSeals = reportDetail.value?.qualificationTypes || []

        viewData.value.sealNames = Array.from(new Set((reportDetail.value?.qualificationTypes || []).map(i => i.sealName))).join('；')
        viewData.value.qualificationNames = Array.from(new Set((reportDetail.value?.qualificationTypes || []).map(i => i.qualificationName))).join('；')
      }).catch(() => {}).finally(() => {
        resolve(true)
      })
    }
  })
}

async function beforeSubmitVerify() {
  if (showReviewDate.value && isRequireReviewDate.value && !formData.value.reviewDate) {
    showDialog({
      title: '提示',
      message: '报告复核日期为必填！',
    })
    return false
  }

  if (showSignDate.value && isRequireSignDate.value && !formData.value.signDate) {
    showDialog({
      title: '提示',
      message: '报告签章日期为必填！',
    })
    return false
  }

  if (formData.value.signDate && reportDetail.value?.testTimeEnd && new Date(formData.value.signDate).getTime() < new Date(reportDetail.value.testTimeEnd).getTime()) {
    showDialog({
      title: '提示',
      message: '试验结束日期应该早于签发日期！',
    })
    return false
  };

  return true
}

// 选择报告附件
async function onSelectAttachment() {
  const checked = ref<string[]>(formData.value.attachmentIds)
  const useType: Record<string, string> = {
    '': '其他',
    '0': 'UDR录入模板',
    '1': '报告文件',
    '2': '记录文件',
    '3': '附件',
    '4': '首件报告',
    '5': '历史报告文件',
    '6': '结果录入模板',
    '7': '分报告',
  }

  showConfirmDialog({
    title: '选择文件',
    width: '460px',
    messageAlign: 'left',
    message: () => h('div', { class: 'radio-group' }, [
      h(CheckboxGroup, {
        'style': 'display: flex;flex-direction: column;gap: 8px;',
        'modelValue': checked.value,
        'shape': 'square',
        'onUpdate:modelValue': (value) => {
          checked.value = value
        },
      }, [
        ...attachmentList.value.map(item => (
          h(Checkbox, {
            name: item.id,
          }, `${item.name}（${useType[item.use_type]}）`)
        )),
      ]),
    ]),
  }).then(() => {
    formData.value.attachmentIds = checked.value
  }).catch(() => {})
}

// 原文件模式 - 提交
async function onSubmit() {
  const check = await beforeSubmitVerify()

  if (!check)
    return

  if (!showAuditDate.value)
    formData.value.auditDate = undefined

  if (!showReviewDate.value)
    formData.value.reviewDate = undefined

  if (!showSignDate.value)
    formData.value.signDate = undefined

  const r = await submitReport(formData.value).catch((e) => {
    showDialog({
      title: '提交失败',
      message: e.message,
    })
  })

  if (r) {
    showSuccessToast('提交成功！')
    router.go(-1)
  }
}

// 原文件模式 - 不同意提交
async function onSubmitDisagree() {
  showConfirmDialog({
    title: '提示',
    message: '确认不同意提交？',
  }).then(async () => {
    const r = await disagreeSubmitReport(formData.value)

    if (r) {
      showSuccessToast('操作成功！')
      router.go(-1)
    }
  }).catch(() => {})
}

// pdf模式 - 提交
async function onSubmitAndGenPdf() {
  const check = await beforeSubmitVerify()

  if (!check)
    return

  if (!showAuditDate.value)
    formData.value.auditDate = undefined

  if (!showReviewDate.value)
    formData.value.reviewDate = undefined

  if (!showSignDate.value)
    formData.value.signDate = undefined

  const r = await submitNewReport(formData.value).catch((e) => {
    showDialog({
      title: '提交失败',
      message: e.message,
    })
  })

  if (r) {
    showDialog({
      title: '提示',
      message: '操作成功，请在PDF生成过后，再确认提交！',
    }).then(() => {
      router.go(-1)
    }).catch(() => {
      router.go(-1)
    })
  }
}

// 历史报告页面初始化
async function initHistoryReport() {
  const data = reportDetail.value

  // 历史报告默认日期
  if (data?.report?.reviewDate)
    formData.value.reviewDate = formatDate(data.report.reviewDate, 1)

  if (data?.report?.auditDate)
    formData.value.auditDate = formatDate(data.report.auditDate, 1)

  if (data?.report?.signDate)
    formData.value.signDate = formatDate(data.report.signDate, 1)
}

// 初始化报告附件
async function initAttachments() {
  const iaLoading = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '加载中...',
  })

  const attachments = reportDetail.value?.attachments || []
  // 是否是线下出具报告
  const isOfflineReport = await testReportService.testTaskService.checkIsOfflineReport()
  // 附件列表
  attachmentList.value = await testReportService.testTaskService.getAttachments()

  iaLoading.close()

  if (attachments.length > 0)
    formData.value.attachmentIds = attachments.map(i => i.id)

  // 如果报告是新报告且报告文件有多份的情况 默认打开报告文件选择
  // 线下出具报告永远只会有一份，无需弹窗
  if (testReportService.isNewReport && !isOfflineReport && attachmentList.value.length > 1)
    onSelectAttachment()
}

// 初始化新报告相关数据
async function initNewReport() {
  // 默认复核日期
  systemParamService.getBusinessParam(SystemParamType.提交报告页面预复核日期默认设置的延后天数).then((r) => {
    if (!r || !r.trim().length)
      return

    if (reportDetail.value?.testTimeEnd) {
      const testTimeEndDate = new Date(reportDetail.value.testTimeEnd)
      formData.value.reviewDate = formatDate(testTimeEndDate.setDate(testTimeEndDate.getDate() + Number.parseInt(r)))
    }
  })

  // 默认签发日期
  systemParamService.getBusinessParam(SystemParamType['提交报告页面预签发日期默认设置的延后天数']).then((r) => {
    if (!r || !r.trim().length) {
      formData.value.signDate = formatDate(new Date(), 1)
      return
    }

    if (reportDetail.value?.testTimeEnd) {
      const testTimeEndDate = new Date(reportDetail.value.testTimeEnd)
      formData.value.signDate = formatDate(testTimeEndDate.setDate(testTimeEndDate.getDate() + Number.parseInt(r)))
    }
  })
}

// 页面初始化
async function init() {
  if (testReportService.isNewReport) {
    // 检查当前任务（或样品下）是否存在正式报告，若存在则不能再提交正式报告
    const gfrLoading = showLoadingToast({ duration: 0, forbidClick: true })
    const formalReport = await testReportService.getFormalReport().finally(gfrLoading.close)
    if (formalReport) {
      // 当前任务存在正式报告，默认选中临时报告
      formData.value.isFormalReport = ReportType.临时报告
      reportTypeDisabled.value = true
    }
  }

  const toastLoading = showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  })

  // 是否pdf流转
  isPDFRoam.value = await systemParamService.getBusinessParam(SystemParamType.审核批准时查看记录报告的方式) === 'pdf'

  // 获取报告数据
  const data = await testReportService.getReportDetail(formData.value.isFormalReport).finally(toastLoading.close)
  const ABReports = data?.ABReports || []

  reportDetail.value = data

  // 是否是线下出具报告
  const isOfflineReport = await testReportService.testTaskService.checkIsOfflineReport()

  // 详情赋值
  viewData.value.testResult = isQualifiedEnum[data?.verdict?.isQualified || 3]
  viewData.value.reportSn = data?.snStr

  const testDetail = await testReportService.testTaskService.getTaskDetail()

  if (testDetail.testDate || testDetail.testEndDate)
    viewData.value.testDate = `${testDetail.testDate ? dayjs(testDetail.testDate).format('YYYY-MM-DD') : '-'} ~ ${testDetail.testEndDate ? dayjs(testDetail.testEndDate).format('YYYY-MM-DD') : '-'}`

  viewData.value.testConditions = testDetail.testConditions || ''

  // 线下出具报告，无需校验
  if (!isOfflineReport) {
    // 检查报告签发日期是否必填
    testReportService.checkIsRequireSignDate().then((r) => {
      isRequireSignDate.value = r
    })

    // 检查报告复核日期是否必填
    systemParamService.getBusinessParam(SystemParamType['提交报告时,复核日期必填']).then((r) => {
      isRequireReviewDate.value = r === SystemParamEnableType.开启
    })
  }

  // 是否为更正报告
  if (data?.report?.revised)
    reportTypeDisabled.value = true

  // 结果带有report对象的是确认提交,不可修改其类型
  if (data?.report) {
    formData.value.isFormalReport = data.report.reportType as ReportType
    reportTypeDisabled.value = true
  }

  // 新报告
  if (isNewReport.value)
    initNewReport()

  // 旧报告
  if (!isNewReport.value) {
    // 历史报告逻辑初始化
    initHistoryReport()
  }

  // 判断AB报告
  if (ABReports.length > 0) {
    viewData.value.reportSn = ABReports[0].coreSn

    showConfirmDialog({
      title: '提示',
      message: '当前移动端设备无法按参数提交报告，请前往PC端提交！',
      cancelButtonText: '跳转网页版进行操作',
      messageAlign: 'left',
      cancelButtonColor: '#999',
      width: '460px',
    }).then(() => {}).catch(() => {
      // router.replace({
      //   path: '/testTaskDetailPC',
      //   query: { testTaskId: testReportService.testTaskId },
      // })
      openTestTaskDetailPage(testReportService.testTaskId)
    })

    viewData.value.sealNames = Array.from(new Set((reportDetail.value?.qualificationTypes || []).map(i => i.sealName))).join('；')
    viewData.value.qualificationNames = Array.from(new Set((reportDetail.value?.qualificationTypes || []).map(i => i.qualificationName))).join('；')
    return
  }

  // 资质提示
  await checkQualification()

  // 报告附件
  initAttachments()

  systemParamService.getBusinessParam(SystemParamType.允许提交报告时设置报告复核日期).then((r) => {
    showReviewDate.value = r === SystemParamEnableType.开启
  })

  systemParamService.getBusinessParam(SystemParamType.允许提交报告时设置报告审核日期).then((r) => {
    showAuditDate.value = r === SystemParamEnableType.开启
  })

  systemParamService.getBusinessParam(SystemParamType.批准报告时签发日期使用实际日期).then((r) => {
    showSignDate.value = r === SystemParamEnableType.关闭
  })
}

init()
</script>

<template>
  <div class="show-title-bar submit-report">
    <TitleBar />
    <div class="submit-report-content">
      <div class="submit-report-form">
        <van-field label="报告类型：" v-bind="fieldAttr">
          <template #input>
            <van-radio-group
              v-model="formData.isFormalReport"
              direction="horizontal"
              :disabled="reportTypeDisabled"
            >
              <van-radio :name="ReportType.正式报告">
                正式报告
              </van-radio>
              <van-radio :name="ReportType.临时报告">
                临时报告
              </van-radio>
              <van-radio v-if="!isPDFRoam" disabled :name="ReportType.按参数拆分报告">
                按参数拆分报告
              </van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field v-model="viewData.reportSn" label="报告编号：" v-bind="infoFieldAttr" />

        <van-field v-model="viewData.sealNames" label="报告印章：" v-bind="infoFieldAttr" />

        <van-field v-model="viewData.qualificationNames" label="资质类型：" v-bind="infoFieldAttr" />

        <van-field label="检测人员：" v-bind="infoFieldAttr">
          <template #input>
            {{ person(ReportPersonType.检测人员) }}
          </template>
        </van-field>

        <van-field label="复核人员：" v-bind="infoFieldAttr">
          <template #input>
            {{ person(ReportPersonType.复核人员) }}
          </template>
        </van-field>

        <van-field label="审核人员：" v-bind="infoFieldAttr">
          <template #input>
            {{ person(ReportPersonType.审核人员) }}
          </template>
        </van-field>

        <van-field label="批准人员：" v-bind="infoFieldAttr">
          <template #input>
            {{ person(ReportPersonType.批准人员) }}
          </template>
        </van-field>

        <template v-if="expandMoreUser">
          <van-field label="记录人员：" v-bind="infoFieldAttr">
            <template #input>
              {{ person(ReportPersonType.记录人员) }}
            </template>
          </van-field>

          <van-field label="协助人员：" v-bind="infoFieldAttr">
            <template #input>
              {{ person(ReportPersonType.协助人员) }}
            </template>
          </van-field>

          <van-field label="报告编写人员：" v-bind="infoFieldAttr">
            <template #input>
              {{ person(ReportPersonType.报告编写人员) }}
            </template>
          </van-field>

          <van-field label="项目负责人员：" v-bind="infoFieldAttr">
            <template #input>
              {{ person(ReportPersonType.项目负责人员) }}
            </template>
          </van-field>
        </template>

        <div class="submit-report-collapse" @click="expandMoreUser = !expandMoreUser">
          <span>{{ expandMoreUser ? '收起' : '展开' }}更多流程人员</span>
          <van-icon :name="expandMoreUser ? 'arrow-up' : 'arrow-down'" size="18" />
        </div>

        <van-field label="检测时间：" v-bind="infoFieldAttr">
          <template #input>
            {{ viewData.testDate }}
          </template>
        </van-field>

        <van-field label="环境条件：" v-bind="infoFieldAttr">
          <template #input>
            {{ viewData.testConditions }}
          </template>
        </van-field>

        <van-field label="检验结果：" v-bind="infoFieldAttr">
          <template #input>
            {{ viewData.testResult }}
          </template>
        </van-field>

        <van-field label="检验结论：" v-bind="infoFieldAttr">
          <template #input>
            {{ reportDetail?.verdict?.testVerdict || '还未填写' }}
          </template>
        </van-field>

        <van-field label="检测备注：" v-bind="infoFieldAttr">
          <template #input>
            {{ reportDetail?.verdict?.testVerdictRemark || '还未填写' }}
          </template>
        </van-field>

        <van-field
          label="报告文件："
          center
          v-bind="infoFieldAttr"
        >
          <template #button>
            <van-button
              plain
              type="primary"
              size="small"
              @click="onSelectAttachment"
            >
              选择
            </van-button>
          </template>
          <template #input>
            {{ reportFileText }}
          </template>
        </van-field>

        <FormItemDate
          v-if="showReviewDate"
          v-model:value="formData.reviewDate"
          label="报告复核日期："
          placeholder="请选择复核日期"
          :required="isRequireReviewDate"
          v-bind="fieldAttr"
        />

        <FormItemDate
          v-if="showAuditDate"
          v-model:value="formData.auditDate"
          label="报告审核日期："
          placeholder="请选择报告审核日期"
          v-bind="fieldAttr"
        />

        <FormItemDate
          v-if="showSignDate"
          v-model:value="formData.signDate"
          label="报告签发日期："
          placeholder="请选择签发日期"
          :required="isRequireSignDate"
          v-bind="fieldAttr"
        />

        <van-field
          v-model="formData.reportOpinion"
          label="提交意见："
          placeholder="请输入内容"
          :rows="2"
          autosize
          type="textarea"
          v-bind="fieldAttr"
        />
      </div>

      <div class="submit-report-handle">
        <!-- <van-button
          block @click="router.replace({
            path: '/testTaskDetailPC',
            query: { testTaskId },
          })"
        >
          跳转网页版进行操作
        </van-button> -->
        <van-button block @click="openTestTaskDetailPage(testTaskId)">
          跳转网页版进行操作
        </van-button>

        <!-- 新报告 -->
        <template v-if="!isABReport">
          <div v-if="isNewReport" class="submit-report-action">
            <van-button v-if="isPDFRoam" block type="primary" @click="onSubmitAndGenPdf">
              保存并生成PDF
            </van-button>
            <van-button v-else block type="primary" @click="onSubmit">
              确定提交
            </van-button>
          </div>
          <!-- 历史报告 -->
          <div v-else class="submit-report-action">
            <van-button block type="danger" @click="onSubmitDisagree">
              不同意提交
            </van-button>
            <van-button block type="primary" @click="onSubmit">
              同意提交
            </van-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.submit-report {
  .submit-report-content {
    height: 100%;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  .submit-report-form {
    flex: 1;
    height: 0;
    overflow-y: auto;
  }

  .submit-report-handle {
    padding: 16px 0;
    display: flex;
    gap: 16px;

    & > button {
      flex: 1;
    }
  }

  .submit-report-action {
    display: flex;
    gap: 16px;
    flex: 1;
  }

  .submit-report-collapse {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: #fff;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      height: 1px;
      background: #ebedf0;
      transform: scaleY(.5);
    }
  }
}
</style>
