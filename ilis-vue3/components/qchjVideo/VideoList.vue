<template>
  <AppProvider>
    <a-card v-if="showTable">
      <a-table
        row-key="id"
        bordered
        :loading="loading"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        @change="handleTableChange"
      >
        <template #emptyText>
          <a-empty description="未配置摄像头" />
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class=" flex items-center justify-center">
              <a-button
                class=" flex items-center justify-center"
                shape="circle"
                :icon="h(CaretRightOutlined)"
                @click="handlePlay(record as IVideoEntity)"
              />
            </div>
          </template>
        </template>
      </a-table>
      <a-modal
        v-model:open="showPlayer"
        centered
        width="70%"
        title="试验视频"
        :keyboard="false"
        :mask-closable="false"
        destroy-on-close
      >
        <template #footer>
          <a-button type="primary" @click="showPlayer = false">
            关闭
          </a-button>
        </template>
        <div class=" h-[400px]">
          <Player :data="currentRow" />
        </div>
      </a-modal>
    </a-card>
    <div v-else class=" w-full h-full">
      <Player :data="currentRow" />
    </div>
  </AppProvider>
</template>

<script lang="ts" setup>
import { CaretRightOutlined } from '@ant-design/icons-vue'
import type { SorterResult } from 'ant-design-vue/es/table/interface'
import Player from './Player.vue'
import { getTaskViewMonitorConfig } from './api'
import type { IVideoEntity } from '.'
import { columns } from '.'

const query = ref({
  testTaskId: '',
})

const orderBy = ref('')

const orderType = ref('')

if (top && top.currentTestTaskId) {
  query.value.testTaskId = top.currentTestTaskId
}
const dataSource = ref([] as any[])

const currentRow = ref({} as IVideoEntity)

const showTable = ref(true)

const loading = ref(false)
async function getList() {
  loading.value = true
  const params = {
    ...query.value,
    ...(orderType.value ? { [orderBy.value]: orderType.value } : {}),
  }
  const { data } = await getTaskViewMonitorConfig(params)
  dataSource.value = data
  if (data?.length === 1) {
    currentRow.value = data[0]
    showTable.value = false
  }
  loading.value = false
}

const showPlayer = ref(false)

function handlePlay(row: IVideoEntity) {
  currentRow.value = row
  showPlayer.value = true
}

/**
 * # 后端排序
 */
function handleTableChange(_pagination: any, _filters: any, sorter: SorterResult) {
  const { order, field } = sorter
  orderBy.value = field as string
  if (field === 'endDate') {
    orderBy.value = 'endDateOder'
  }
  if (field === 'startDate') {
    orderBy.value = 'startDateOder'
  }

  if (order === 'descend') {
    orderType.value = 'desc'
  }
  else if (order === 'ascend') {
    orderType.value = 'asc'
  }
  else {
    orderType.value = ''
  }
  getList()
}

getList()
</script>
