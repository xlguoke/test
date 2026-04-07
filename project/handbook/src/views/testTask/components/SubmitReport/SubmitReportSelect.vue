<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import type { TestTaskReport } from '../../../../../packages/custodian/src/types/report'
import { checkNeedUkeySign } from './checkNeedUkeySign'
import { TestTaskService } from '@/providers/services/TestTaskService'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'

type OptionItem = TestTaskReport & { label: string, value: string }

const router = useRouter()

const { enableClearState } = toRefs(useUdrStore())

const show = ref(false)

const checked = ref('')

const testTaskId = ref('')

const testTaskStatus = ref<string>()

const options = ref<OptionItem[]>([])

async function open(taskId: string) {
  const testTaskService = new TestTaskService(taskId)

  const gtdLoading = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '加载中...',
  })
  const taskDetail = await testTaskService.getTaskDetail().finally(gtdLoading.close)

  testTaskId.value = taskId
  testTaskStatus.value = taskDetail.status
  checked.value = ''

  const toastLoading = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '加载中...',
  })
  const res = await testTaskService.getTestTaskReportInfo().finally(toastLoading.close)

  const obj = res.obj

  if (!obj.length) {
    toSubmitReportPage()
    return
  }

  const fList = obj.filter(i => i.needMeSubmit && i.isScrap !== '1')
  if (!fList.length) {
    toSubmitReportPage()
    return
  }

  options.value = fList.map(j => ({
    ...j,
    label: j.reportSn,
    value: j.reportId,
  }))
  options.value.push({
    label: '新报告',
    value: '',
  } as OptionItem)

  checked.value = options.value[0]?.value

  show.value = true
}

function onOk() {
  // 新报告
  if (!checked.value) {
    if (testTaskStatus.value && Number(testTaskStatus.value) >= 30) {
      showDialog({
        title: '提示',
        message: '试验检测已经完成,不能再提交报告！',
      })
      return
    }
  }

  show.value = false
  toSubmitReportPage()
}

async function toSubmitReportPage() {
  let pdfRoundMode: string | undefined
  let needMeSubmit: string | undefined

  if (checked.value) {
    const item = options.value.find(i => i.reportId === checked.value)
    if (item) {
      pdfRoundMode = item.pdfRoundMode ? '1' : '0'
      needMeSubmit = item?.needMeSubmit ? '1' : '0'

      if (item.mergeAuditSignature && item.needMeSubmit)
        await checkNeedUkeySign()
    }
  }

  router.push({
    path: '/submitReport',
    query: {
      testTaskId: testTaskId.value,
      reportId: checked.value,
      pdfRoundMode,
      needMeSubmit,
    },
  })

  enableClearState.value = false
}

defineExpose({
  open,
})
</script>

<template>
  <van-dialog
    v-model:show="show"
    title="选择报告"
    show-cancel-button
    width="460px"
    @confirm="onOk"
  >
    <p class="tip">
      当前任务有多份报告提交，请选择要提交的报告
    </p>
    <van-radio-group
      v-model="checked"
      icon-size="22px"
    >
      <van-radio
        v-for="(item, index) in options"
        :key="index"
        :name="item.value"
      >
        {{ item.label }}
      </van-radio>
    </van-radio-group>
  </van-dialog>
</template>

<style lang="less" scoped>
.van-radio-group {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip {
  font-size: 14px;
  padding: 0 16px;
  color: #666;
  padding-top: 8px;
}
</style>
