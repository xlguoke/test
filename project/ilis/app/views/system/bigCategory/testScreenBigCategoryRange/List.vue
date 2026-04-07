<template>
  <AppProvider>
    <ht-modal
      v-model:open="open"
      title="材料检测驾驶舱检测大类选择范围"
      width="600px"
      :mask-closable="false"
      destroy-on-close
      centered
    >
      <a-space class="mt-2">
        <a-button type="primary" @click="onAdd">
          新增
        </a-button>
        <a-button @click="onBatchDel">
          删除
        </a-button>
      </a-space>

      <a-table
        class="mt-4"
        row-key="bigCategoryId"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        :scroll="{ y: 420 }"
        :row-selection="getRowSelection()"
        bordered
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'Action'">
            <a-button
              v-if="index !== 0"
              type="link"
              @click="onMove(index, 'up')"
            >
              上移
            </a-button>
            <a-button
              v-if="index !== dataSource.length - 1"
              type="link"
              @click="onMove(index, 'down')"
            >
              下移
            </a-button>
            <a-button
              type="link"
              danger
              @click="onDel(record)"
            >
              删除
            </a-button>
          </template>
        </template>
      </a-table>
      <template #footer>
        <a-button @click="open = false">
          关闭
        </a-button>
      </template>
    </ht-modal>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { DashboardSelectDTO } from '~/views/system/bigCategory/testScreenBigCategoryRange/api.ts'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { delDashboardSelect, getDashboardList, saveDashboardSelect } from '~/views/system/bigCategory/testScreenBigCategoryRange/api.ts'

import Add from './components/Add.vue'

const open = ref(false)

const columns = [
  {
    title: '序号',
    dataIndex: 'dashboardOrderNum',
    width: 65,
  },
  {
    title: '大类名称',
    dataIndex: 'bigCategoryName',
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: 120,
  },
]

const loading = ref(false)

const selectedRowKeys = ref<string[]>([])

const dataSource = ref<DashboardSelectDTO[]>([])

watch(open, (val) => {
  if (val) {
    getList()
  }
})

function getRowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[]) => {
      selectedRowKeys.value = keys
    },
  }
}

async function getList() {
  loading.value = true
  const res = await getDashboardList().finally(() => {
    loading.value = false
  })

  selectedRowKeys.value = []
  dataSource.value = res.data.sort((a, b) => (a.dashboardOrderNum - b.dashboardOrderNum))
}

async function onMove(index: number, type: 'up' | 'down') {
  const currentRow = dataSource.value[index]
  const targetRow = dataSource.value[type === 'up' ? index - 1 : index + 1]

  if (currentRow && targetRow) {
    loading.value = true
    await saveDashboardSelect([
      {
        bigCategoryId: currentRow.bigCategoryId,
        dashboardOrderNum: targetRow.dashboardOrderNum,
      },
      {
        bigCategoryId: targetRow.bigCategoryId,
        dashboardOrderNum: currentRow.dashboardOrderNum,
      },
    ]).finally(() => {
      loading.value = false
    })
    getList()
  }
}

function onAdd() {
  AnyDialogHelper.showModel(Add, {
    dashboardOrderNum: dataSource.value.length > 0 ? (dataSource.value[dataSource.value.length - 1].dashboardOrderNum) : 0,
  }).then(() => {
    getList()
  })
}

async function onBatchDel() {
  if (!selectedRowKeys.value.length) {
    message.warning('请勾选要删除的数据！')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确定删除吗？',
    async onOk() {
      await delDashboardSelect(selectedRowKeys.value)
      message.success('操作成功！')
      getList()
    },
  })
}

async function onDel(record) {
  Modal.confirm({
    title: '提示',
    content: '确定删除吗？',
    async onOk() {
      await delDashboardSelect([record.bigCategoryId])
      message.success('操作成功！')
      getList()
    },
  })
}

window.$testScreenBigCategoryRange = {
  open: () => {
    open.value = true
  },
}
</script>
