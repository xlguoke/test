<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { ReportFile } from '../../../../../packages/custodian/src/types/report'
import { openTestTaskDetailPage } from '../openTestTaskDetailPage'
import { SubmitReportEntity, useSubmitReportHook } from './useSubmitReportHook'
import type { ReportInfoDTO } from '@/providers/services/TestReportService'
import { ReportPersonType, TestReportService, isQualifiedEnum } from '@/providers/services/TestReportService'
import { request } from '@/axios'
import type { LogDTO } from '@/type/log'
import { formatDate } from '@/utils'

const porps = defineProps({
  testTaskId: String,
  reportId: String,
  needMeSubmit: String,
})

const useTypeObj: Record<string, string> = {
  0: 'UDR录入模板',
  1: '报告文件',
  2: '记录文件',
  3: '附件',
}

const router = useRouter()

const testTaskId = computed(() => porps.testTaskId || '')

const reportId = computed(() => porps.reportId || '')

const testReportService = new TestReportService(testTaskId.value, reportId.value)

const {
  submitPdfSign,
  submitPdfReport,
  disagreeSubmitReport,
} = useSubmitReportHook(testReportService)

const formData = ref(new SubmitReportEntity())

const isOfflineReport = ref(false)

const logs = ref<LogDTO[]>([])

const files = ref<ReportFile[]>([])

/** 报告详情 */
const reportInfo = ref<ReportInfoDTO>()

/** 详情信息 */
const viewData = ref({
  sealNames: '',
  qualificationNames: '',
  testResult: '',
  reportSn: '',
  testDate: '',
  testConditions: '',
})

const progressText = ref('')

const rTimer = ref()

// 需要转换
const needConvert = computed(() => (reportInfo.value?.convertStatus === '2' && !isOfflineReport.value))

// 签审合一
const mergeAuditSignature = computed(() => reportInfo.value?.mergeAuditSignature && porps.needMeSubmit === '1')

// 展开更多
const expandMoreUser = ref(false)

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
  return (reportInfo.value?.reportPersonVos || []).filter(i => i.type === type).map(i => i.userRealName).join('；')
}

// 签字确认
async function onSubmitSign() {
  await submitPdfSign(formData.value)
  showSuccessToast('操作成功！')
  router.go(-1)
}

// 提交
async function onSubmit() {
  const r = await submitPdfReport(formData.value)

  if (r) {
    showSuccessToast('操作成功！')
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

// 报告转换进度查询
async function checkConvertProgress() {
  const data = await testReportService.getConvertProgress()

  if (data === -1) {
    progressText.value = '文件转换中...'
    return
  }

  if (data === 0)
    progressText.value = '已排到当前报告，正在拼命转换中，请耐心等待...'
  else
    progressText.value = `文件转换排队中，当前报告前面剩余${data}份`
}

// 加载报告日志
async function loadLogs() {
  const res = await request({
    url: '/ilis2/tSLogProcessController.do?getProcessLogList',
    params: {
      objectType: 3,
      objectId: testReportService.reportId,
      relationQry: false,
    },
  }) as {
    rows: LogDTO[]
  }

  logs.value = res.rows || []
}

// 加载报告文件
async function loadReportFiles() {
  if (needConvert.value) {
    files.value = []
    return
  }

  const res = await request({
    url: '/ilis2/rest/wordReportController/task/report/files/tree',
    params: {
      reportId: testReportService.reportId,
    },
  }) as {
    rows: ReportFile[]
  }

  files.value = res.rows
}

async function refresh() {
  // 报告信息
  testReportService.clearCache('reportInfo')
  const data = await testReportService.getReportInfo()

  reportInfo.value = data

  loadLogs()
  loadReportFiles()

  if (needConvert.value)
    checkConvertProgress()

  rTimer.value = setTimeout(async () => {
    refresh()
  }, 10000)
}

// 页面初始化
async function init() {
  const toastLoading = showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  })
  // 报告信息
  const data = await testReportService.getReportInfo().finally(toastLoading.close)

  reportInfo.value = data

  // 详情赋值
  viewData.value.testResult = isQualifiedEnum[data?.isQualified || 3]
  viewData.value.reportSn = data?.reportNumber
  viewData.value.sealNames = Array.from(new Set((data?.reportSeals || []).map(i => i.sealName))).join('；')
  viewData.value.qualificationNames = Array.from(new Set((data?.reportSeals || []).map(i => i.qualificationName))).join('；')

  const testDetail = await testReportService.testTaskService.getTaskDetail()

  if (testDetail.testDate || testDetail.testEndDate)
    viewData.value.testDate = `${testDetail.testDate ? dayjs(testDetail.testDate).format('YYYY-MM-DD') : '-'} ~ ${testDetail.testEndDate ? dayjs(testDetail.testEndDate).format('YYYY-MM-DD') : '-'}`

  viewData.value.testConditions = testDetail.testConditions || ''

  // 检查是否线下出具报告
  isOfflineReport.value = await testReportService.testTaskService.checkIsOfflineReport()

  if (needConvert.value)
    checkConvertProgress()

  loadLogs()
  loadReportFiles()

  setTimeout(() => {
    refresh()
  }, 5000)
}

onUnmounted(() => {
  clearTimeout(rTimer.value)
})

init()
</script>

<template>
  <div class="show-title-bar submit-report">
    <TitleBar />
    <div class="submit-report-content">
      <div class="submit-report-form">
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
            {{ reportInfo?.verdict || '还未填写' }}
          </template>
        </van-field>

        <van-field label="检测备注：" v-bind="infoFieldAttr">
          <template #input>
            {{ reportInfo?.verdictRemark || '还未填写' }}
          </template>
        </van-field>

        <van-field
          v-model="formData.reportOpinion"
          label="提交意见："
          placeholder="请输入内容"
          :rows="2"
          autosize
          type="textarea"
          v-bind="fieldAttr"
        />

        <div class="sub-title">
          报告相关文件
        </div>

        <div v-if="needConvert" style="color: #666;margin-top: 16px;padding-left: 12px;padding-bottom: 16px;">
          {{ progressText }}
        </div>
        <template v-else>
          <div v-for="item in files" :key="item.id" class="log-card">
            <div>
              名称：
              <span v-if="item.type === 'file'" style="color: #ff6a2b;">[系统]</span>
              {{ item.name }}
            </div>
            <div>文件类型：{{ useTypeObj[item.useType] }}</div>
            <div>上传时间：{{ item.uploadDate }}</div>
          </div>
        </template>

        <div class="sub-title">
          报告日志
        </div>

        <div v-for="item in logs" :key="item.id" class="log-card">
          <div>内容：<span v-html="item.content"></span></div>
          <div>处理意见：{{ item.opinion }}</div>
          <div>对象编号：{{ item.objectSn }}</div>
          <div>处理人：{{ item.createName }}</div>
          <div>处理时间：{{ formatDate(item.createDate, 2) }}</div>
        </div>
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

        <div class="submit-report-action">
          <van-button block type="danger" @click="onSubmitDisagree">
            不同意提交
          </van-button>

          <van-button v-if="mergeAuditSignature" block type="primary" @click="onSubmitSign">
            签字确认
          </van-button>
          <van-button v-else block type="primary" @click="onSubmit">
            确认
          </van-button>
        </div>
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
    margin-top: 16px;
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

  .sub-title {
    font-size: 14px;
    font-weight: bold;
    border-left: solid 4px #0066ec;
    padding-left: 8px;
    line-height: 18px;
    margin-top: 16px;
  }

  .log-card {
    border-radius: 4px;
    margin-top: 16px;
    padding: 16px;
    background: #fff;
    font-size: 12px;
    line-height: 22px;
    color: #151515;
  }
}
</style>
