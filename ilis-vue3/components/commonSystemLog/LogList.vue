<template>
  <AppProvider>
    <a-table
      row-key="id"
      :data-source="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="false"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'content'">
          <div v-html="text" />
        </template>
      </template>
    </a-table>
  </AppProvider>
</template>

<script lang="ts" setup>
import { getLogList } from './api'
import type { ILog } from '.'
import { columns } from '.'

const props = defineProps<{
  id?: string
  logType?: string
  list?: ILog[]
}>()

const logTypeInner = ref(props.logType)

const idInner = ref(props.id)

const dataSource = ref<ILog[]>(props.list || [])

const loading = ref(false)

if (!logTypeInner.value && parent.BUS_LOG_TYPE) {
  logTypeInner.value = parent.BUS_LOG_TYPE
}

if (!idInner.value && parent.BUS_ID) {
  idInner.value = parent.BUS_ID
}

async function getList() {
  loading.value = true
  const { data } = await getLogList(idInner.value, logTypeInner.value)
  dataSource.value = data
  loading.value = false
}

if (!props.list) {
  getList()
}
</script>
