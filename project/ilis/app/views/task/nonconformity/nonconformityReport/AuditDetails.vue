<template>
  <IlisContainer>
    <div class="mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'Action'">
            <a-button type="link" @click="onCheckTask(record)">
              查看任务
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import { getNonconformityReportAuditDetail } from './api.ts'

const urlParams = new URLSearchParams(location.search)

const businessKey = urlParams.get('businessKey')

const loading = ref(false)

const dataSource = ref([])

const columns: ColumnType[] = [
  {
    title: '不合格情况',
    dataIndex: 'description',
    width: 220,
  },
  {
    title: '创建人',
    dataIndex: 'createName',
    width: 85,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: 120,
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: 80,
  },
]

getDetail()

async function getDetail() {
  if (!businessKey) {
    return
  }
  loading.value = true
  const res = await getNonconformityReportAuditDetail(businessKey).finally(() => {
    loading.value = false
  })
  dataSource.value = [res.data]
}

function onCheckTask(record) {
  const url = `/ilis2/testTaskController.do?goTestTaskDetail&id=${record.testTaskId}&readonly=1&readType=5`
  window.open(url)
}
</script>
