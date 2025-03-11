<template>
  <AppProvider>
    <a-card>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        :loading="loading"
        :pagination="false"
        :scroll="{
          x: '1200px',
        }"
      >
        <template #bodyCell="{ text }">
          <a-popover placement="topLeft">
            <template #content>
              <span>{{ text }}</span>
            </template>
            {{ text }}
          </a-popover>
        </template>
      </a-table>
    </a-card>
  </AppProvider>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { getReferenceRecordList } from './api'
import { type IReferenceRecord, columns } from '.'

const loading = ref(false)

const dataSource = ref<IReferenceRecord[]>([])

async function getList() {
  if (!top?.taskId) {
    return message.error('未传入任务id')
  }
  loading.value = true
  const { data } = await getReferenceRecordList(top.taskId)
  dataSource.value = data
  loading.value = false
}

getList()
</script>
