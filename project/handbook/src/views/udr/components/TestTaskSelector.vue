<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { z } from 'zod'
import BaseModal from './BaseModal.vue'
import { request } from '@/axios'
import RollingLoading from '@/components/rollingLoading/index.vue'
import type { TaskListQuery } from '@/type/testTask'
import { onlineTaskList } from '@/type/testTask'
import TestTaskSearch from '@/views/testTask/components/TestTaskSearch.vue'
import { useTestTask } from '@/views/testTask/components/useTestTask'

const props = defineProps({
  show: {
    type: Boolean,
    defalut: false,
  },
})

const emits = defineEmits(['update:show', 'select'])

provide('offlineMarker', {})
provide('isOnlineList', true)

const visible = computed({
  get() {
    return props.show
  },
  set(val) {
    emits('update:show', val)
  },
})

watch(() => props.show, (val) => {
  if (val)
    getDatas()
})

const {
  indeterminate,
  selectedAll,
  selectedKeys,
  testTaskDatas,
  loading,
  total,
  changeSelectedAll,
} = useTestTask()

const query = ref<{
  page: number
  size: number
  status?: string
}>({
  page: 1,
  size: 20,
  status: '10',
})

// 选择试验任务
function onSelectTestTask() {
  if (!selectedKeys.value.length) {
    showDialog({
      title: '提示',
      message: '请勾选数据后操作！',
    })
    return
  }

  emits('select', selectedKeys.value)
  onClose()
}

/**
 * @param flag 是否是下拉加载
 */
async function getDatas(flag?: boolean) {
  loading.value = true

  if (flag)
    query.value.page++
  else
    query.value.page = 1

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
    const list = res.rows || []

    if (flag)
      testTaskDatas.value.push(...list)
    else testTaskDatas.value = list

    total.value = res.count || 0
  }
  catch (err: any) {
    // eslint-disable-next-line no-alert
    alert(err.message)
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

function onClose() {
  emits('update:show', false)

  selectedKeys.value = []
  testTaskDatas.value = []
  query.value = {
    page: 1,
    size: 20,
    status: '10',
  }
  defaultQuery.value = undefined
  total.value = 0
}
</script>

<template>
  <BaseModal v-model:show="visible" title="任务列表" @close="onClose">
    <div class="task-data-list">
      <TestTaskSearch
        :default-query="defaultQuery"
        tab-key="online"
        :in-udr="true"
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
      </div>

      <div class="test-task-datas">
        <RollingLoading @load="getDatas(true)">
          <div class="pd-lr">
            <van-checkbox-group v-model="selectedKeys" shape="square">
              <div
                v-for="item in testTaskDatas"
                :key="item.testTaskId"
                class="common-media-wrap my-list"
              >
                <van-checkbox :name="item.testTaskId" class="common-media-content  task-checkbox-box">
                  <h4 class="task-name">
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
              </div>
            </van-checkbox-group>
          </div>
        </RollingLoading>
      </div>
    </div>

    <template #footer>
      <van-button block type="primary" @click="onSelectTestTask">
        保存
      </van-button>
    </template>
  </BaseModal>
</template>

<style lang="less" scoped>
.task-data-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-checkbox-box {
  line-height: 18px;
  font-size: 14px;
  :deep(.van-checkbox__label){
    line-height: unset;
  }
}

.batch-handle {
  padding: 16px;
  padding-top: 0;
  padding-left: 24px;
  background: #fff;
}

.test-task-datas {
  flex: 1;
  height: 0;
  overflow-y: auto;

  .task-checkbox-box {
    display: flex;
    align-items: center;
  }
  .task-name {
    margin-bottom: 5px;
    font-size: 14px;
    line-height: 18px;
    white-space: pre-wrap;
  }
  .ant-col {
    display: flex;
    white-space: pre-wrap;
    .label{
      white-space: nowrap;
    }
    .value{
      flex: 1;
      width: 0;
      max-height: 42px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}
</style>
