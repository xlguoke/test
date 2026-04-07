<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  TaskQuery,
  countTask,
  deleteTask,
  findTasks,
  getTask,
} from 'custodian'
import { useRoute } from 'vue-router'
import TestTaskSearch from './TestTaskSearch.vue'
import OfflineTaskNoData from './OfflineTaskNoData.vue'
import { useTestTask } from './useTestTask'
import uploadManageStore from '@/stores/uploadManage'
import RollingLoading from '@/components/rollingLoading/index.vue'
import type { TaskListQuery, UploadListDTO } from '@/type/testTask'
import { translateError } from '@/utils/translateError'

const { tabKey } = defineProps<{ tabKey: string }>()
const { addUploadDatas } = uploadManageStore()
const { uploadDatas, uploadFinishIds } = storeToRefs(uploadManageStore())
const route = useRoute()

const {
  indeterminate,
  selectedAll,
  selectedKeys,
  testTaskDatas,
  loading,
  total,
  marker,
  errMsg,
  goDetail,
  changeSelectedAll,
  openUdrOffline,
} = useTestTask()

watch(
  () => route.meta.refresh,
  (val) => {
    if (!val)
      return
    refreshList()
  },
)

watch(
  () => uploadFinishIds.value,
  (ids) => {
    refreshUploadStatus(ids)
  },
)

// 上传完成更新状态
const updateLock = ref(false)
async function refreshUploadStatus(ids: string[]) {
  if (updateLock.value || ids.length === 0)
    return
  const len = ids.length
  for (let i = len - 1; i >= 0; i--) {
    await refreshDataStatus(ids[i])
    uploadFinishIds.value.splice(i, 1)
  }
  if (uploadFinishIds.value.length === 0)
    updateLock.value = false
  else refreshUploadStatus(uploadFinishIds.value)
}

const query = new TaskQuery()
onMounted(() => {
  query.size = 20
  query.addOrder({
    property: 'taskCreateTime',
    direction: 'desc',
  })
  getCount()
  getDatas()
})

async function getDatas(flag?: boolean) {
  loading.value = true
  if (flag)
    query.page++
  else query.page = 1

  try {
    const res = await findTasks(query)
    const list = []

    for (let i = 0; i < res.length; i++) {
      const item = res[i]
      list.push({
        id: item.id,
        testTaskId: item.testTaskId || '',
        taskCreateTime: item.taskCreateTime ? item.taskCreateTime.substring(0, 10) : '',
        testTaskCode: item.testTaskCode || '',
        sampleName: item.sampleName || '',
        projectName: item.projectName || '',
        testObjectCode: item.testObjectCode || '',
        params: item.params,
        onsite: item.onsite,
        status: item.status,
        taskStatus: undefined,
      })
    }

    if (flag)
      testTaskDatas.value.push(...list)
    else testTaskDatas.value = list
  }
  catch (err) {
    Promise.reject(err)
  }
  loading.value = false
}

async function getCount() {
  const count = await countTask(query)
  total.value = count
}

let cacheQuery = ''
const defaultQuery = ref()
function searchData(q: TaskListQuery, isDefault?: boolean) {
  const strQ = JSON.stringify(q)
  query.projectName = q.projectName
  query.fuzzy = q.q
  query.status = q.status
  query.createdFrom = q.allocDateStart
  query.createdTo = q.allocDateEnd
  query.params = q.paramName
  if (cacheQuery !== strQ) {
    cacheQuery = strQ
    getCount()
  }
  if (isDefault)
    defaultQuery.value = q

  selectedKeys.value = []
  getDatas()
}

// 更新数据状态
async function refreshDataStatus(taskId: string) {
  return getTask(taskId).then((res) => {
    for (let i = 0; i < testTaskDatas.value.length; i++) {
      const item = testTaskDatas.value[i]
      if (item.id === taskId) {
        item.status = res.status
        return
      }
    }
  })
}

// 添加后数据，刷新列表
function refreshList() {
  getCount()
  getDatas()
}

defineExpose({
  defaultSearch: searchData,
  refreshList,
})

// 上传
const uploadLoading = ref(false)
function uploadTask() {
  if (selectedKeys.value.length === 0)
    return showToast({ type: 'fail', message: '请选择要上传的任务' })

  uploadLoading.value = true
  const uploadList: UploadListDTO[] = []
  const repeats: string[] = []
  const watiWrite: string[] = []

  // 检查重复上传的任务
  for (let i = 0; i < uploadDatas.value.length; i++) {
    const d = uploadDatas.value[i]
    if (selectedKeys.value.includes(d.id))
      repeats.push(d.testTaskCode as string)
  }

  // 检查待填写的任务
  for (let i = 0; i < testTaskDatas.value.length; i++) {
    const item = testTaskDatas.value[i]
    if (
      !selectedKeys.value.includes(item.id)
      || repeats.includes(item.testTaskCode as string)
    )
      continue

    if (item.status === 'pending')
      watiWrite.push(item.testTaskCode as string)
    else uploadList.push(item)
  }

  if (repeats.length === 0 && watiWrite.length === 0)
    return submitUploadDatas(uploadList)

  const repeatCode = repeats.join('，')
  const waitWriteCode = watiWrite.join('，')
  const repeatMsg = repeatCode ? `【${repeatCode}】已在上传队列中，` : ''
  const waitWriteMsg = waitWriteCode ? `【${waitWriteCode}】为待填写状态，` : ''
  showDialog({
    title: '提示',
    message: `试验任务${repeatMsg}${waitWriteMsg}无法上传！点击“确认”将跳过以上数据`,
    messageAlign: 'left',
    showCancelButton: true,
  }).then(() => {
    submitUploadDatas(uploadList)
  }).catch(() => {
    uploadLoading.value = false
  })
}

// 提交至上传列表
function submitUploadDatas(uploadList: UploadListDTO[]) {
  selectedKeys.value = []
  selectedAll.value = false
  uploadLoading.value = false
  if (uploadList.length === 0)
    return
  showToast({ type: 'success', message: '数据已添加至上传队列' })
  addUploadDatas(uploadList)
}

// 批量删除
const delLoading = ref(false)
function batchDelete() {
  if (selectedKeys.value.length === 0)
    return showToast({ type: 'fail', message: '请选择要删除的任务' })

  const uploaded = uploadDatas.value.filter(d =>
    selectedKeys.value.includes(d.id),
  )
  if (uploaded.length > 0) {
    const taskCodes = uploaded.map(d => d.testTaskCode as string).join('，')
    showDialog({
      title: '提示',
      message: `任务【${taskCodes}】在上传队列中，无法删除！`,
      messageAlign: 'left',
    })
    return
  }
  showDialog({
    title: '提示',
    message: `离线任务删除后将无法恢复，确认删除？`,
    messageAlign: 'left',
    showCancelButton: true,
  }).then(async () => {
    delLoading.value = true
    const errs: { [k: string]: any } = {}
    for (let i = 0; i < selectedKeys.value.length; i++) {
      const _id = selectedKeys.value[i]
      try {
        await deleteTask(_id)
        const item = testTaskDatas.value.find(d => d.id === _id)
        if (item && item.testTaskId)
          delete marker[item.testTaskId]
      }
      catch (err) {
        errs[_id] = err
      }
    }

    if (JSON.stringify(errs) !== '{}')
      delErrorModal(errs)
    else
      showToast({ type: 'success', message: '删除成功' })

    selectedKeys.value = []
    delLoading.value = false
    getCount()
    getDatas()
  }).catch(() => {
  })
}

function delErrorModal(errs: { [k: string]: any }) {
  const errors = []
  for (let i = 0; i < testTaskDatas.value.length; i++) {
    const item = testTaskDatas.value[i]
    if (errs[item.id]) {
      const errMsg = translateError(errs[item.id])
      errors.push(`${item.testTaskCode}：${errMsg.message}\n`)
    }
  }
  showDialog({
    title: '以下任务删除失败',
    message: errors.join(''),
    messageAlign: 'left',
  })
}

// 试验记录
async function goTestTaskRecord(taskId: string) {
  try {
    loading.value = true
    await openUdrOffline(taskId)
    refreshDataStatus(taskId)
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
      <van-checkbox
        v-model="selectedAll"
        shape="square"
        :disabled="testTaskDatas.length === 0"
        :indeterminate="indeterminate"
        @change="changeSelectedAll"
      >
        {{ selectedAll ? '取消全选' : '全选' }}
      </van-checkbox>
      <van-space>
        <van-button
          type="primary"
          size="small"
          @click="goDetail('')"
        >
          创建任务
        </van-button>
        <van-button
          type="primary"
          size="small"
          :loading="uploadLoading"
          @click="uploadTask"
        >
          立即上传
        </van-button>
        <van-button
          type="danger"
          size="small"
          :loading="delLoading"
          @click="batchDelete"
        >
          批量删除
        </van-button>
      </van-space>
    </div>

    <div class="test-task-datas">
      <RollingLoading @load="getDatas(true)">
        <template #noData>
          <OfflineTaskNoData v-if="testTaskDatas.length === 0" />
        </template>
        <div class="pd-lr">
          <!-- <CheckboxGroup v-model:value="selectedKeys" style="width: 100%"> -->
          <van-checkbox-group v-model="selectedKeys" shape="square">
            <div
              v-for="item in testTaskDatas"
              :key="item.id"
              class="common-media-wrap my-list"
            >
              <!-- <Checkbox
                :value="item.id"
                class="common-media-content task-checkbox-box"
              > -->
              <van-checkbox :name="item.id" class="common-media-content  task-checkbox-box">
                <div class="task-name">
                  <h4 class="name">
                    <span :class="`task-onsite-${item.onsite ? 'jian' : 'li'}`">
                      {{ item.onsite ? '建' : '离' }}
                    </span>
                    {{ item.sampleName }}
                  </h4>
                  <span :class="`status status-${item.status}`">
                    <span v-if="item.status === 'pending'"> 待填写 </span>
                    <span v-if="item.status === 'edited'"> 待上传 </span>
                    <span v-if="item.status === 'uploaded'"> 已上传 </span>
                    <span v-if="item.status === 'uploadFailed'"> 上传失败 </span>
                  </span>
                </div>
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
                <a class="handle-item" @click="goDetail(item.id, item.onsite)">
                  <i class="iconfont icon-a-zu478" />
                  {{ item.onsite ? '试验登记' : '试验详情' }}
                </a>
                <a class="handle-item" @click="goTestTaskRecord(item.id || '')">
                  <i class="iconfont icon-bianji" />
                  试验记录
                </a>
              </div>
            </div>
          <!-- </CheckboxGroup> -->
          </van-checkbox-group>
        </div>
      </RollingLoading>
    </div>
  </div>
</template>

<style lang="less" scoped>
.task-checkbox-box {
  line-height: 18px;
  font-size: 14px;
  :deep(.van-checkbox__label){
    line-height: unset;
  }
}
.task-name {
  display: flex;
  align-items: center;
  .task-onsite-jian,
  .task-onsite-li {
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    color: #fff;
    border-radius: 4px;
    background-color: #1a8b60;
  }
  .task-onsite-li {
    background-color: #f3a759;
  }
  .status {
    color: #fff;
    margin-left: 1rem;
    padding: 0 8px;
    border-radius: 3px;
    font-size: 12px;
    transform: skewX(-15deg);
    & > span {
      display: inline-block;
      transform: skewX(15deg);
    }
  }
  .status-pending {
    background-color: var(--primary-color);
  }
  .status-edited {
    background-color: var(--success-color);
  }
  .status-uploaded {
    background-color: var(--warning-color);
  }
  .status-uploadFailed {
    background-color: var(--error-color);
  }
}
</style>
