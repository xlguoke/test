<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, h, ref } from 'vue'
import type { TestTaskReport } from '../../../../packages/custodian/src/types/report'
import { checkNeedUkeySign } from './SubmitReport/checkNeedUkeySign'
import { useBeforeSubmitReportCheckHook } from './SubmitReport/useBeforeSubmitReportCheckHook'
import { openTestTaskDetailPage } from './openTestTaskDetailPage'
import { TestTaskService } from '@/providers/services/TestTaskService'
import { request } from '@/axios'

const route = useRoute()

const router = useRouter()

const testTaskId = computed(() => route.query.testTaskId as string)

const testTaskController = new TestTaskService(testTaskId.value)

const { beforeBubmitReport } = useBeforeSubmitReportCheckHook(testTaskId.value)

const reportList = ref<TestTaskReport[]>([])

const isOfflineReport = ref(false)

testTaskController.checkIsOfflineReport().then((val) => {
  isOfflineReport.value = val
})

function onTip(message: string) {
  showConfirmDialog({
    title: '提示',
    message,
    cancelButtonText: '跳转网页版进行操作',
    messageAlign: 'left',
    cancelButtonColor: '#999',
    width: '460px',
  }).catch(() => {
    // router.push({
    //   path: '/testTaskDetailPC',
    //   query: { testTaskId: testTaskId.value },
    // })
    openTestTaskDetailPage(testTaskId.value)
  })
}

async function onSubmit(item: TestTaskReport) {
  await beforeBubmitReport()

  if (item.mergeAuditSignature && item.needMeSignature)
    await checkNeedUkeySign()

  router.push({
    path: '/submitReport',
    query: {
      testTaskId: testTaskId.value,
      reportId: item.reportId,
      pdfRoundMode: item.pdfRoundMode ? '1' : '0',
      needMeSubmit: item.needMeSubmit ? '1' : '0',
    },
  })
}

function onDel(item: TestTaskReport) {
  const content = ref('')

  showConfirmDialog({
    title: '提示',
    messageAlign: 'left',
    width: '460px',
    message: () => h('div', {}, [
      h('div', {
        style: 'color: #ff0000',
      }, '删除报告后，报告将不能恢复，请输入删除原因：'),
      h('textarea', {
        style: 'padding: 4px;border: solid 1px #e2e2e2;height: 80px;width: 100%;margin-top: 8px;resize: none;',
        value: content.value,
        onInput: (e: any) => {
          content.value = e.target.value
        },
      }),
    ]),
  }).then(async () => {
    const dLoading = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    await request({
      method: 'delete',
      url: `/ilis2/rest/report/${item.reportId}`,
      params: {
        taskId: testTaskId.value,
        opinion: content.value,
        isReserve: '1',
      },
    }).finally(dLoading.close)

    getReportList()
  }).catch(() => {})
}

function onAbandoned(item: TestTaskReport) {
  const content = ref('')

  showConfirmDialog({
    title: '提示',
    messageAlign: 'left',
    width: '460px',
    message: () => h('div', {}, [
      h('div', {
        style: 'color: #ff0000',
      }, '作废报告后，报告编号仍会被占用，请输入作废原因：'),
      h('textarea', {
        style: 'padding: 4px;border: solid 1px #e2e2e2;height: 80px;width: 100%;margin-top: 8px;resize: none;',
        value: content.value,
        onInput: (e: any) => {
          content.value = e.target.value
        },
      }),
    ]),
  }).then(async () => {
    const dLoading = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    await request({
      method: 'post',
      url: `/ilis2/rest/report/state/abandoned`,
      params: {
        reportId: item.reportId,
        taskId: testTaskId.value,
        opinion: content.value,
      },
    }).finally(dLoading.close)

    getReportList()
  }).catch(() => {})
}

function onCancelAbandoned(item: TestTaskReport) {
  showConfirmDialog({
    title: '提示',
    messageAlign: 'left',
    width: '460px',
    message: '确定取消作废吗？',
  }).then(async () => {
    const dLoading = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    await request({
      method: 'delete',
      url: `/ilis2/rest/report/state/abandoned`,
      params: {
        reportId: item.reportId,
        taskId: testTaskId.value,
      },
    }).finally(dLoading.close)

    getReportList()
  }).catch(() => {})
}

async function getReportList() {
  const loading = showLoadingToast({
    duration: 0,
    forbidClick: true,
  })
  const res = await testTaskController.getTestTaskReportInfo().finally(loading.close)

  reportList.value = res.obj || []
}

getReportList()
</script>

<template>
  <div class="show-title-bar report-detail">
    <TitleBar />
    <div class="report-detail-body">
      <div class="report-detail-title">
        历史报告
      </div>
      <div class="report-detail-ul">
        <van-empty v-if="!reportList.length" description="暂无历史报告"></van-empty>
        <div v-for="item in reportList" :key="item.reportId" class="report-detail-li">
          <div>报告编号：<a href="javascript:;" @click="onTip('当前移动端设备无法查看报告详情，请前往PC端查看报告')">{{ item.reportSn }}</a></div>
          <div>报告资质：{{ item.qualification }}</div>

          <template v-if="item.isScrap === '1'">
            <div>报告状态：已作废</div>
          </template>
          <template v-else>
            <div v-if="item.statusDesc">
              报告状态：{{ item.statusDesc }}
            </div>
            <template v-if="item.submittedUser || item.waitSubmitUser">
              <div v-if="item.submittedUser && item.waitSubmitUser">
                提交状态：{{ item.submittedUser }}已提交报告，待{{ item.waitSubmitUser }}提交报告
              </div>
              <div v-else-if="item.submittedUser">
                提交状态：{{ item.submittedUser }}已提交报告
              </div>
              <div v-else-if="item.waitSubmitUser">
                提交状态：待{{ item.waitSubmitUser }}提交报告
              </div>
            </template>

            <template v-if="(item.signedUser || item.waitSignUser) && !isOfflineReport">
              <div v-if="item.signedUser && item.waitSignUser">
                签字状态：{{ item.signedUser }}已签字，待{{ item.waitSignUser }}签字
              </div>
              <div v-else-if="item.signedUser">
                签字状态：{{ item.signedUser }}已签字
              </div>
              <div v-else-if="item.waitSignUser">
                签字状态：待{{ item.waitSignUser }}签字
              </div>
            </template>

            <template v-if="item.pdfRoundMode">
              <div v-if="isOfflineReport">
                PDF文件：文件转换完成
              </div>
              <template v-else>
                <div v-if="item.convertStatus">
                  PDF文件：{{ item.convertStatus }}
                </div>
              </template>
            </template>
          </template>

          <div class="report-detail-action">
            <van-button
              v-if="item.needMeSubmit && item.isScrap !== '1'"
              size="small"
              @click="onSubmit(item)"
            >
              确认提交
            </van-button>

            <van-button
              v-if="['8', '9'].includes(item.reportStatus) && item.pdfRoundMode"
              size="small"
              @click="onTip('当前移动端设备无法修改报告信息，请前往PC端修改报告')"
            >
              修改
            </van-button>

            <template v-if="['8', '9'].includes(item.reportStatus) && item.isScrap !== '1' && !item.revised">
              <van-button size="small" @click="onAbandoned(item)">
                作废
              </van-button>
              <van-button size="small" @click="onDel(item)">
                删除
              </van-button>
            </template>

            <template v-if="item.isScrap === '1' && !item.revised">
              <van-button size="small" @click="onCancelAbandoned(item)">
                取消作废
              </van-button>
              <van-button size="small" @click="onDel(item)">
                删除
              </van-button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.report-detail {
  .report-detail-body {
    margin: 16px;
    padding: 16px;
    border-radius: 4px;
  }

  .report-detail-title {
    border-left: solid 4px #0066ec;
    padding-left: 8px;
    font-size: 16px;
    line-height: 18px;
    font-weight: bold;
    background: #fff;
    padding: 12px 16px;
  }

  .report-detail-ul {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }

  .report-detail-li {
    font-size: 14px;
    color: #151515;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    a {
      color: #0066ec;
    }
  }

  .report-detail-action {
    display: flex;
    gap: 16px;
    justify-content: end;
    text-align: right;
  }
}
</style>
