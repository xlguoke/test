<script lang="ts" setup>
import { inject, onMounted, ref, watch } from 'vue'
import type {
  task,
} from 'custodian'
import {
  findByTestTaskIds,
  saveTask,
} from 'custodian'
import { z } from 'zod'
import { getLogger } from '@ilis/cordova-plugin-log4c'
import { useTestTask } from './useTestTask'
import TestTaskSearch from './TestTaskSearch.vue'
import SubmitReportSelect from './SubmitReport/SubmitReportSelect.vue'
import TestTaskReturn from './TestTaskReturn.vue'
import { TestTaskReturnType } from '.'
import { request } from '@/axios'
import RollingLoading from '@/components/rollingLoading/index.vue'
import type { TaskListDTO, TaskListQuery } from '@/type/testTask'
import { onlineTaskList } from '@/type/testTask'
import type { Device } from '@/device'
import { _DEVICE } from '@/device'
import { useCredentialStore } from '@/stores/credentials'
import { translateError } from '@/utils/translateError'
import { useBeforeSubmitReportCheckHook } from '@/views/testTask/components/SubmitReport/useBeforeSubmitReportCheckHook'

const { tabKey } = defineProps<{ tabKey: string }>()
const log = getLogger('testTask')
const {
  indeterminate,
  selectedAll,
  selectedKeys,
  testTaskDatas,
  loading,
  total,
  marker,
  errMsg,
  changeSelectedAll,
  // goDetail,
  openUdrOnline,
  fetchTask,
} = useTestTask()

const isDev = __DEV__
const device = inject(_DEVICE) as Device
const loadOfflineList = inject('loadOfflineList') as Function

const submitReportSelectRef = ref()

const testTaskReturnRef = ref()

const query = ref<{
  page: number
  size: number
  status?: string
}>({
  page: 1,
  size: 20,
  status: '10',
})

onMounted(() => {
  getDatas()
})

// 监听网络变化
let timer: any = null
let reloadCount = 0
watch(
  () => device.online.value,
  (val) => {
    if (!val)
      return
    timer = setInterval(() => {
      reloadCount++
      getDatas()
    }, 1000)
  },
)

function closeReload() {
  timer && clearInterval(timer)
  reloadCount = 0
}

// 离线标记
async function updateMarker(list: TaskListDTO[]) {
  if (list.length === 0)
    return
  const testTaskIds = list.map((d: any) => d.testTaskId)
  const offlineTask = await findByTestTaskIds(testTaskIds)
  if (offlineTask.length === 0)
    return
  offlineTask.forEach((d) => {
    d.testTaskId && (marker[d.testTaskId] = true)
  })
}

/**
 * @param flag 是否是下拉加载
 */
async function getDatas(flag?: boolean) {
  if (!device.online.value)
    return
  loading.value = true

  if (flag)
    query.value.page++
  else query.value.page = 1

  try {
    const res = await request({
      url: '/ilis2/rest/handbook/online/task/list',
      method: 'get',
      params: query.value,
      schema: z.object({
        count: z.number(),
        rows: z.array(onlineTaskList),
      }),
    })
    closeReload()
    const list = res.rows || []

    if (flag)
      testTaskDatas.value.push(...list)
    else testTaskDatas.value = list

    updateMarker(list)
    total.value = res.count || 0
  }
  catch (err) {
    /**
     * 正常流程下，请求失败时，直接抛出错误；
     * 离线状态恢复网络后重新请求，最多尝试5次，如果5次后还是失败，则不再尝试，直接抛出错误。
     */
    if (reloadCount > 5)
      closeReload()

    if (reloadCount === 0 || reloadCount > 5)
      Promise.reject(err)
  }
  loading.value = false
}

const defaultQuery = ref<TaskListQuery>()
function searchData(q: TaskListQuery) {
  query.value = {
    page: query.value.page,
    size: query.value.size,
    ...q,
    status: q.status && q.status.length === 1 ? q.status[0] : '',
  }
  defaultQuery.value = { ...q }
  selectedKeys.value = []
  getDatas()
}

defineExpose({
  defaultSearch: searchData,
  refreshData: getDatas,
})

// 设为离线的数据校验
function validSetOffline() {
  const taskCodes = []
  const statusCodes = []
  for (let i = 0; i < selectedKeys.value.length; i++) {
    const key = selectedKeys.value[i]
    const item = testTaskDatas.value.find(d => d.testTaskId === key)
    if (!item)
      continue
    if (marker[key])
      taskCodes.push(item.testTaskCode)

    item.status === '20' && statusCodes.push(item.testTaskCode)
  }
  if (taskCodes.length > 0 || statusCodes.length > 0) {
    const msg1
      = taskCodes.length > 0
        ? `任务${taskCodes.join(',')}已设为离线任务，无需重复设置，`
        : ''
    const msg2
      = statusCodes.length > 0
        ? `任务${statusCodes.join(',')}已处理，不能设为离线任务，`
        : ''
    showToast({
      type: 'fail',
      message: `${msg1}${msg2}请重新选择！`,
    })
    return
  }
  return taskCodes.length === 0 && statusCodes.length === 0
}

// 设为离线任务
const setOfflineLoading = ref(false)
async function setOffline() {
  if (!device.online.value) {
    return showToast({
      type: 'fail',
      message: '当前处于离线状态，无法设为离线任务！',
    })
  }
  if (selectedKeys.value.length === 0) {
    return showToast({
      type: 'fail',
      message: '请选择任务！',
    })
  }

  if (!validSetOffline())
    return

  setOfflineLoading.value = true

  try {
    const resErr: { [k: string]: any } = {}
    const successKey = []
    for (let i = 0; i < selectedKeys.value.length; i++) {
      const key = selectedKeys.value[i]
      try {
        const fields = [
          'taskInfo',
          'taskParam',
          'taskRecordSet',
          'jsonDataGetter',
          'taskTemplate',
        ]
        const res = await fetchTask(key, fields)
        if (!res)
          throw res

        const oTask: task.Task = {
          ...res,
          taskRecordSets: res.taskRecordSets || [],
          taskAppTemplates: res.taskAppTemplates || [],
          taskParams: res.taskParams || [],
        }
        await saveTask(oTask)
        successKey.push(key)
      }
      catch (err) {
        resErr[key] = err
      }
    }

    for (let i = 0; i < successKey.length; i++) {
      const key = successKey[i]
      marker[key] = true
    }

    if (JSON.stringify(resErr) !== '{}') {
      // 设为离线任务失败
      const errors = []
      for (let i = 0; i < testTaskDatas.value.length; i++) {
        const item = testTaskDatas.value[i]
        if (resErr[item.testTaskId]) {
          const errMsg = translateError(resErr[item.testTaskId])
          errors.push(`${item.testTaskCode}：${errMsg.message}\n`)
        }
      }
      showDialog({
        message: errors.join(''),
        messageAlign: 'left',
      })
      setOfflineLoading.value = false
    }
    else {
      showToast({
        type: 'success',
        message: '设为离线任务成功！',
      })
    }
    selectedKeys.value = []
    // 刷新离线列表
    loadOfflineList()
  }
  catch (err: any) {
    log.error('设为离线任务：', err)
    errMsg(err)
  }
  setOfflineLoading.value = false
}

// 提交报告
async function goSubmitReport(row: TaskListDTO) {
  const { beforeBubmitReport } = useBeforeSubmitReportCheckHook(row.testTaskId)

  await beforeBubmitReport()

  submitReportSelectRef.value?.open(row.testTaskId)
}

// 退回
function onReturn(row: TaskListDTO) {
  testTaskReturnRef.value.open(row.testTaskId, TestTaskReturnType.试验检测中)
}

// 试验记录
async function goTestTaskRecord(row: TaskListDTO) {
  const toast = showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  // 试验检测中的在线任务才支持试验录入，其他状态只能查看
  const readOnlyMode = !(row.status === '10' || row.taskStatus === '20')
  openUdrOnline(row.testTaskId, readOnlyMode).finally(() => {
    toast.close()
  })
}

// 数据采集
function goDataAcquisition(row: TaskListDTO) {
  const credentialStore = useCredentialStore()
  location.href = `${location.origin}/data-acquisition.html?taskId=${row.testTaskId}&unitCode=${credentialStore.code}`
}
</script>

<template>
  <div class="task-data-list">
    <TestTaskSearch
      :default-query="defaultQuery"
      :tab-key="tabKey"
      @search="searchData"
    />
    <div class="batch-handle">
      <van-checkbox
        v-model="selectedAll"
        shape="square"
        :disabled="testTaskDatas.length === 0"
        :indeterminate="indeterminate"
        @change="changeSelectedAll"
      >
        {{ selectedAll ? '取消全选' : '全选' }}
      </van-checkbox>
      <div class="handles">
        <van-button
          type="primary"
          size="small"
          :loading="setOfflineLoading"
          @click="setOffline"
        >
          设为离线任务
        </van-button>
      </div>
    </div>

    <div v-if="!device.online.value" class="not-netwrok">
      <van-notice-bar color="#1989fa" background="#ecf9ff" left-icon="info-o">
        网络连接发生问题，请检测你的网络后重试或者直接进入离线任务进行填写
      </van-notice-bar>
      <div v-show="testTaskDatas.length === 0" class="descript">
        <img src="@/assets/images/no-network.png" alt="无网络">
        <p>暂无网络！</p>
      </div>
    </div>

    <div class="test-task-datas">
      <RollingLoading @load="getDatas(true)">
        <template #noData>
          <p v-if="!device.online.value" class="no-data">
            {{ testTaskDatas.length > 0 ? '暂无网络！' : '' }}
          </p>
        </template>
        <div class="pd-lr">
          <van-checkbox-group v-model="selectedKeys" shape="square">
            <div
              v-for="item in testTaskDatas"
              :key="item.testTaskId"
              class="common-media-wrap my-list"
            >
              <van-checkbox :name="item.testTaskId" class="common-media-content  task-checkbox-box">
                <h4 class="task-name">
                  <span v-if="!!marker[item.testTaskId]" class="is-offline">离</span>
                  <span class="name">{{ item.sampleName }}</span>
                </h4>
                <van-row :gutter="[10, 5]" justify="start">
                  <van-col :span="24">
                    <span class="label">任务编号：</span>
                    <span class="value">{{ item.testTaskCode }}</span>
                  </van-col>
                  <van-col :span="24">
                    <span class="label">样品编号：</span>
                    <span class="value">{{ item.testObjectCode }}</span>
                  </van-col>
                  <van-col :span="24">
                    <span class="label">试验参数：</span>
                    <span class="value">{{ item.params }}</span>
                  </van-col>
                  <van-col :span="24">
                    <span class="label">创建日期：</span>
                    <span class="value">{{ item.taskCreateTime }}</span>
                  </van-col>
                </van-row>
              </van-checkbox>
              <div class="common-media-handle">
                <!-- <a class="handle-item" @click="goDetail(item.testTaskId)">
                  <i class="iconfont icon-a-zu478" />
                  查看详情
                </a> -->
                <a class="handle-item" @click="goTestTaskRecord(item)">
                  <template v-if="item.status === '10'">
                    <i class="iconfont icon-bianji" />
                    试验记录
                  </template>
                  <template v-else>
                    <i class="iconfont icon-a-zu478" />
                    查看记录
                  </template>
                </a>
                <a v-if="item.status === '10'" class="handle-item" @click="goSubmitReport(item)">
                  <i class="iconfont icon-navicon-dbd" />
                  提交报告
                </a>
                <a v-if="item.status === '10'" class="handle-item" @click="onReturn(item)">
                  <i class="iconfont icon-fasong" />
                  退回
                </a>
                <a v-if="isDev" class="handle-item" @click="goDataAcquisition(item)">
                  <van-icon name="setting-o" size="16" style="margin-right: 4px;" />
                  数据采集
                </a>
              </div>
            </div>
          <!-- </CheckboxGroup> -->
          </van-checkbox-group>
        </div>
      </RollingLoading>
    </div>

    <!-- 提交报告 - 选择报告 -->
    <SubmitReportSelect ref="submitReportSelectRef" />

    <!-- 流程退回 -->
    <TestTaskReturn ref="testTaskReturnRef" @success="getDatas()" />
  </div>
</template>

<style lang="less" scoped>
.not-netwrok {
  margin: 1rem 0;
  padding: 0 2.5rem;
  color: #aaa;
  line-height: 50px;
  font-size: 16px;
  .descript {
    text-align: center;
  }
}
.task-checkbox-box {
  line-height: 18px;
  font-size: 14px;
  :deep(.van-checkbox__label){
    line-height: unset;
  }
  .is-offline {
    display: inline-block;
    margin-right: 0.6rem;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    color: #fff;
    border-radius: 4px;
    background-color: #f3a759;
  }
}

@media screen and (max-width: 576px) {
  .no-netwrok {
    font-size: 14px;
    img {
      width: 60%;
      max-width: 300px;
    }
  }
}

.no-data {
  margin: 8% auto 0;
  text-align: center;
  color: #aaa;
  line-height: 50px;
  font-size: 16px;
}
</style>
