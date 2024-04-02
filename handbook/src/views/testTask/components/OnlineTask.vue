<script lang="ts" setup>
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Modal,
  Row,
  message,
} from 'ant-design-vue'
import { h, inject, onMounted, ref, watch } from 'vue'
import {
  findByTestTaskIds,
  normalizeHitekCenterUrl,
  saveTask,
  task,
} from 'custodian'
import { z } from 'zod'
import { openUdrOnline } from '../udr'
import { useTestTask } from './useTestTask'
import TestTaskSearch from './TestTaskSearch.vue'
import { request } from '@/axios'
import RollingLoading from '@/components/rollingLoading/index.vue'
import type { TaskListDTO, TaskListQuery } from '@/type/testTask'
import { onlineTaskList } from '@/type/testTask'
import type { Device } from '@/device'
import { _DEVICE } from '@/device'
import { useCredentialStore } from '@/stores/credentials'
import { translateError } from '@/utils/translateError'

const { tabKey } = defineProps<{ tabKey: string }>()

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
  goDetail,
} = useTestTask()

const device = inject(_DEVICE) as Device
const loadOfflineList = inject('loadOfflineList') as Function
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
watch(
  () => device.online.value,
  (val) => {
    if (!val)
      return
    timer = setInterval(getDatas, 1000)
  },
)

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
    timer && clearInterval(timer)
    const list = res.rows || []

    if (flag)
      testTaskDatas.value.push(...list)
    else testTaskDatas.value = list

    updateMarker(list)
    total.value = res.count || 0
  }
  catch (err) {
    console.error('在线任务数据：', err)
    errMsg(err)
  }
  loading.value = false
}

const defaultQuery = ref<TaskListQuery>()
function searchData(q: TaskListQuery) {
  query.value = {
    page: query.value.page,
    size: query.value.size,
    ...q,
    status: q.status.length === 1 ? q.status[0] : '',
  }
  defaultQuery.value = { ...q }
  getDatas()
}

defineExpose({
  defaultSearch: searchData,
})

// 设为离线的数据校验
function validSetOffline() {
  const taskCodes = []
  const statusCodes = []
  for (let i = 0; i < selectedKeys.value.length; i++) {
    const key = selectedKeys.value[i]
    if (marker[key]) {
      const item = testTaskDatas.value.find(d => d.testTaskId === key)
      if (!item)
        continue
      taskCodes.push(item.testTaskCode)
      item.status === '20' && statusCodes.push(item.testTaskCode)
    }
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
    message.warning(`${msg1}${msg2}请重新选择！`)
    return
  }
  return taskCodes.length === 0 && statusCodes.length === 0
}

// 设为离线任务
const setOfflineLoading = ref(false)
async function setOffline() {
  if (selectedKeys.value.length === 0)
    return message.warning('请选择任务！')

  if (!validSetOffline())
    return

  setOfflineLoading.value = true

  try {
    const resErr: { [k: string]: any } = {}
    const successKey = []
    for (let i = 0; i < selectedKeys.value.length; i++) {
      const key = selectedKeys.value[i]
      try {
        const res = await fetchTask(key)
        await saveTask(res)
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
          errors.push(h('p', `${item.testTaskCode}：${errMsg.message}`))
        }
      }
      Modal.error({
        title: `以下任务设为离线任务失败`,
        content: errors,
        centered: true,
        okText: '确认',
      })
      setOfflineLoading.value = false
    }
    else {
      message.success('设为离线任务成功！')
    }
    selectedKeys.value = []
    // 刷新离线列表
    loadOfflineList()
  }
  catch (err: any) {
    console.error('设为离线任务：', err)
    errMsg(err)
  }
  setOfflineLoading.value = false
}

async function fetchTask(id: string) {
  return await request({
    url: `/ilis2/rest/task/data/${id}`,
    method: 'get',
    schema: task.Validator.task,
  })
}

// 试验记录
async function goTestTaskRecord(row: TaskListDTO) {
  try {
    loading.value = true
    const task = await fetchTask(row.testTaskId)
    const inputTemplate = task.taskAppTemplates.find(
      it => it.templateType === '1',
    )
    if (!inputTemplate)
      throw new Error('当前任务未配置录入模板')
    const template = inputTemplate.appTemplates.find(it => it.type === '2')
    if (!template)
      throw new Error('当前任务未配置正确的试验模板')
    const main = template.appTemplateFiles.find(
      it => it.fileName === 'main.json',
    )
    if (!main)
      throw new Error('当前试验模板未配置主文件')

    const credentialStore = useCredentialStore()
    await openUdrOnline(
      new URL(main.filePath, normalizeHitekCenterUrl(task.hitekServer)).href,
      {
        taskId: task.testTaskId,
        token: credentialStore.token,
        unitCode: credentialStore.code,
        testItemId: inputTemplate.testItemId,
        testObjectId: task.testObjectId,
        readOnlyMode: row.status !== '10',
      },
    )
    loading.value = false
  }
  catch (err: any) {
    loading.value = false
    errMsg(err)
  }
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
      <Checkbox
        v-model:checked="selectedAll"
        :disabled="testTaskDatas.length === 0"
        :indeterminate="indeterminate"
        @change="changeSelectedAll"
      >
        {{ selectedAll ? '取消全选' : '全选' }}
      </Checkbox>
      <div class="handles">
        <Button
          type="primary"
          size="small"
          :loading="setOfflineLoading"
          @click="setOffline"
        >
          设为离线任务
        </Button>
      </div>
    </div>

    <div v-if="!device.online.value" class="not-netwrok">
      <Alert
        message="网络连接发生问题，请检测你的网络后重试或者直接进入离线任务进行填写"
        type="error"
        show-icon
      />
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
          <CheckboxGroup v-model:value="selectedKeys">
            <div
              v-for="item in testTaskDatas"
              :key="item.testTaskId"
              class="common-media-wrap my-list"
            >
              <Checkbox
                :value="item.testTaskId"
                class="common-media-content task-checkbox-box"
              >
                <h4 class="task-name">
                  <span v-if="!!marker[item.testTaskId]" class="is-offline">离</span>
                  <span class="name">{{ item.sampleName }}</span>
                </h4>
                <Row :gutter="10">
                  <Col :xs="24" :sm="12">
                    <span class="label">任务编号：</span>
                    <span class="value">{{ item.testTaskCode }}</span>
                  </Col>
                  <Col :xs="24" :sm="12">
                    <span class="label">样品编号：</span>
                    <span class="value">{{ item.testObjectCode }}</span>
                  </Col>
                  <Col :xs="24" :sm="12">
                    <span class="label">试验参数：</span>
                    <span class="value">{{ item.params }}</span>
                  </Col>
                  <Col :xs="24" :sm="12">
                    <span class="label">创建日期：</span>
                    <span class="value">{{ item.taskCreateTime }}</span>
                  </Col>
                </Row>
              </Checkbox>
              <div class="common-media-handle">
                <a class="handle-item" @click="goDetail(item.testTaskId)">
                  <i class="iconfont icon-a-zu478" />
                  查看详情
                </a>
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
              </div>
            </div>
          </CheckboxGroup>
        </div>
      </RollingLoading>
    </div>
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
