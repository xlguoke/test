<script setup lang="ts">
import { computed, provide, ref, toRefs, watch } from 'vue'
import type { TimePickerColumnType } from 'vant'
import { showSuccessToast } from 'vant'
import dayjs from 'dayjs'
import { useUdrStore } from '../../provider/useUdrStore'
import { UdrLifecycle } from '../../provider/UdrLifecycle'
import { request } from '@/axios'
import { udrCore } from '@/views/udr/provider/UdrCore'
import TestTaskInfoView from '@/views/testTask/components/TestTask/TestTaskInfoView.vue'
import { useTestTaskInfo } from '@/views/testTask/components/useTestTaskInfo'
import DatePickerSelector from '@/components/Selector/DatePickerSelector.vue'
import { useTestDateFormatHooks } from '@/hooks/useTestDateHooks'

const udrStore = useUdrStore()

const { getTestTaskId } = udrStore

const { panelManager, isOfflineUdrPage, isOnlineUdrPage } = toRefs(udrStore)

const {
  initData,
  detailData,
  taskParams,
  testTaskData,
} = useTestTaskInfo(isOfflineUdrPage.value, getTestTaskId())

const { toSaveDate, toShowDate, enableTestDateMinute } = useTestDateFormatHooks(isOnlineUdrPage.value)

provide('isConfirmEdit', true)
provide('formData', detailData)
provide('taskParams', taskParams)

const activePancelKey = ref(0)

const selectDateFormat = computed(() => {
  if (enableTestDateMinute.value)
    return ['hour', 'minute'] as TimePickerColumnType[]
  return undefined
})

const sampleSendDateTip = ref('')

const testtaskFormData = ref({
  testStartDate: '',
  testEndDate: '',
  testConditions: '',
})

watch(testTaskData, (data) => {
  if (data) {
    testtaskFormData.value = {
      testStartDate: toShowDate(data.testDate),
      testEndDate: toShowDate(data.testEndDate),
      testConditions: data.testConditions || '',
    }

    if (isOnlineUdrPage.value) {
      checkSampleSendDate()

      setTestConclusionData()
    }
  }
}, {
  immediate: true,
})

const showStartPicker = ref(false)

const showEndPicker = ref(false)

// 保存试验检测结论
async function saveTestConclusion() {
  udrCore.$this.setUdrVisibility(false)

  const loading = showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const res = await request({
    url: `/ilis2/testTaskController.do?doSaveTestTaskConclusion`,
    method: 'post',
    data: {
      testTaskId: getTestTaskId(),
      testObjectId: testTaskData.value?.testObjects[0].id,
      isQualified: testTaskData.value?.isQualified,
      testConclusion: testTaskData.value?.testConclusion || '',
      testConclusionRemark: testTaskData.value?.testConclusionRemark || '',
      testStartDate: toSaveDate(testtaskFormData.value.testStartDate),
      testEndDate: toSaveDate(testtaskFormData.value.testEndDate),
      testConditions: testtaskFormData.value.testConditions,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  }).finally(loading.close).catch(() => {
    udrCore.$this.setUdrVisibility(true)
  }) as any

  if (res.success) {
    initData()
    showSuccessToast({
      message: '保存成功！',
      duration: 2,
    })
  }

  setTimeout(() => {
    udrCore.$this.setUdrVisibility(true)
  }, 2000)
}

function checkSampleSendDate() {
  const testStartDate = testtaskFormData.value.testStartDate
  const sampleSendDate = testTaskData.value?.consignInfo.sampleSendDate

  if (!testStartDate || !sampleSendDate) {
    sampleSendDateTip.value = ''
    return
  }

  if (new Date(testStartDate) < new Date(sampleSendDate))
    sampleSendDateTip.value = `注意:检测开始日期${testStartDate}早于送样日期${sampleSendDate}`
  else
    sampleSendDateTip.value = ''
}

function onCancel() {
  panelManager.value.testTaskDetail = false
}

// udr切换任务
UdrLifecycle.subscribe('OnTestTaskChanged', () => {
  onCancel()
})

// udr保存成功后，需要刷新
UdrLifecycle.subscribe('OnSaveComplete', async (status) => {
  if (status === 1)
    initData()
})

// 往启动脚本设置需要保存的检测环境相关数据
function setTestConclusionData() {
  udrCore.$udr.invokeUdrScript(`$global.SetTestConclusionData(${JSON.stringify({
    testStartDate: testTaskData.value?.testDate ? dayjs(testTaskData.value?.testDate).format('YYYY-MM-DD') : undefined,
    testEndDate: testTaskData.value?.testEndDate ? dayjs(testTaskData.value?.testEndDate).format('YYYY-MM-DD') : undefined,
    testConditions: testTaskData.value?.testConditions,
  })})`)
}
</script>

<template>
  <div class="task-detail-panel">
    <van-icon class="task-detail-panel-close" name="cross" @click="panelManager.testTaskDetail = false" />

    <van-tabs v-if="!isOfflineUdrPage" v-model:active="activePancelKey" shrink>
      <van-tab title="试验详情" :name="0" swipeable></van-tab>
      <van-tab title="环境条件" :name="1" swipeable>
      </van-tab>
    </van-tabs>

    <div class="task-detail-panel-main">
      <TestTaskInfoView
        v-if="activePancelKey === 0"
        :is-offline-data="isOfflineUdrPage"
        :detail-data="detailData"
        :test-task-data="testTaskData"
        :task-params="taskParams"
      />

      <template v-if="activePancelKey === 1">
        <div class="content-main">
          <div class="content-item">
            <h4 class="page-title-min">
              检测时间
            </h4>

            <div class="test-date-row">
              <input
                type="text" readonly placeholder="开始时间" :value="testtaskFormData.testStartDate" @click="() => {
                  udrCore.$this.setUdrVisibility(false);
                  showStartPicker = true;
                }"
              />
              -
              <input
                type="text" readonly placeholder="结束时间" :value="testtaskFormData.testEndDate" @click="() => {
                  udrCore.$this.setUdrVisibility(false);
                  showEndPicker = true;
                }"
              />
            </div>
            <div v-if="sampleSendDateTip" class="task-detail-panel-tip">
              {{ sampleSendDateTip }}
            </div>
          </div>

          <div class="content-item">
            <h4 class="page-title-min">
              环境条件
            </h4>

            <textarea
              v-model="testtaskFormData.testConditions" class="test-conditions" placeholder="请输入"
              rows="8"
            ></textarea>
          </div>
        </div>

        <div class="test-task-action">
          <van-button @click="onCancel">
            取消
          </van-button>
          <van-button type="primary" @click="saveTestConclusion">
            保存
          </van-button>
        </div>
      </template>
    </div>

    <!-- 开始时间 -->
    <DatePickerSelector
      v-model:show="showStartPicker"
      :default-value="testtaskFormData.testStartDate"
      :time-columns="selectDateFormat"
      :enable-time="enableTestDateMinute"
      @change="(val) => {
        testtaskFormData.testStartDate = toShowDate(val)
        checkSampleSendDate()
      }"
    />

    <!-- 结束时间 -->
    <DatePickerSelector
      v-model:show="showEndPicker"
      :default-value="testtaskFormData.testEndDate"
      :time-columns="selectDateFormat"
      :enable-time="enableTestDateMinute"
      @change="(val) => {
        testtaskFormData.testEndDate = toShowDate(val)
      }"
    />
  </div>
</template>

<style lang="less" scoped>
.page-title-min {
  margin-bottom: 2rem;
  font-size: 16px;
  font-weight: 600;
  line-height: 16px;
  &::before {
    content: '';
    float: left;
    margin-top: 2px;
    margin-right: 10px;
    width: 4px;
    height: 14px;
    vertical-align: middle;
    background-color: #0284fe;
    border-radius: 0 3px 3px 0;
  }
}

.content-main {
  padding: 0 1.6rem 1.6rem 1.6rem;
  height: 100%;
}

:deep(.content-item) {
  padding: 1.5rem 0!important;
}

.base-info-item {
  padding: 0.5rem 0;
  line-height: 18px;
}

.task-detail-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.task-detail-panel-tip {
  color: #ff0000;
  margin-top: 8px;
}

.task-detail-panel-close {
  position: absolute;
  right: 1.6rem;
  top: 1.6rem;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
}

.task-detail-panel-main {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.test-conditions {
  border: solid 1px #e2e2e2;
  padding: 8px;
  border-radius: 2px;
  font-size: 1.4rem;
  width: 100%;
}

.test-date-row {
  display: flex;
  align-items: center;
  gap: 16px;

  input {
    flex: 1;
    width: 0;
    height: 3.2rem;
    border-radius: 2px;
    background: #F5F5F5;
    color: #151515;
    font-size: 1.4rem;
    text-align: center;
    border: 0;
    max-width: 220px;
  }
}

.test-task-action {
  position: absolute;
  left: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 1.6rem;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 1.6rem;
  border-top: solid 1px #e2e2e2;
  z-index: 100;

  .van-button {
    flex: 1;
  }

  .van-button--primary {
    flex: 2;
  }
}
</style>
