<template>
  <AppProvider>
    <ht-modal
      v-model:open="open"
      centered
      width="70%"
      title="留样视频"
      :keyboard="false"
      :mask-closable="false"
      destroy-on-close
    >
      <div class="py-4">
        <a-empty v-if="!dataSource.length" description="未配置摄像头"></a-empty>
        <a-table
          v-else
          row-key="id"
          bordered
          :loading="loading"
          :columns="columns"
          :data-source="dataSource"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'Action'">
              <div class=" flex items-center justify-center">
                <a-button
                  class=" flex items-center justify-center"
                  shape="circle"
                  :icon="h(CaretRightOutlined)"
                  @click="handlePlay(record as SampleVideoEntity)"
                />
              </div>
            </template>
          </template>
        </a-table>
      </div>
      <template #footer>
        <a-button @click="open = false">
          关闭
        </a-button>
      </template>
    </ht-modal>

    <a-modal
      v-model:open="showPlayer"
      centered
      width="70%"
      title="留样视频播放"
      :keyboard="false"
      :mask-closable="false"
      destroy-on-close
    >
      <template #footer>
        <a-button @click="showPlayer = false">
          关闭
        </a-button>
      </template>
      <div class=" h-[400px]">
        <Player :data="currentRow" />
      </div>
    </a-modal>
  </AppProvider>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { SampleVideoEntity } from './api'
import { CaretRightOutlined } from '@ant-design/icons-vue'
import { getSampleVideoList } from './api'
import Player from './Player.vue'

const columns = ref<ColumnType[]>([])

const dataSource = ref([] as any[])

const currentRow = ref({} as SampleVideoEntity)

const open = ref(false)

const loading = ref(false)

async function getList(testObjectId: string) {
  loading.value = true
  const { data } = await getSampleVideoList(testObjectId).finally(() => {
    loading.value = false
  })

  dataSource.value = data

  if (data.length > 0) {
    const c = []

    const hasOtherInfo = data.some(item => item.otherInfo && item.otherInfo.sampleRecord)
    if (hasOtherInfo) {
      c.push({
        title: '仓位',
        dataIndex: 'depot',
        customRender: ({ record }) => (record.otherInfo?.sampleRecord?.depot || '/'),
      })
      c.push({
        title: '类型',
        dataIndex: 'obj',
        customRender: ({ record }) => (record.otherInfo?.sampleRecord?.type || '/'),
      })
      c.push({
        title: '位置',
        dataIndex: 'location',
        customRender: ({ record }) => (record.otherInfo?.sampleRecord?.location || '/'),
      })
    }

    c.push({
      title: '开始时间',
      dataIndex: 'startDate',
    })
    c.push({
      title: '结束时间',
      dataIndex: 'endDate',
    })
    c.push({
      title: '操作',
      align: 'center',
      dataIndex: 'Action',
    })

    columns.value = c as ColumnType[]
  }
}

const showPlayer = ref(false)

function handlePlay(row: SampleVideoEntity) {
  currentRow.value = row
  showPlayer.value = true
}

function onOpen(testObjectId: string) {
  open.value = true
  getList(testObjectId)
}

window.$checkVideo = {
  open: (testObjectId: string) => {
    onOpen(testObjectId)
  },
}
</script>
