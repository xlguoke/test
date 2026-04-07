<template>
  <AppProvider>
    <a-table
      row-key="id"
      :data-source="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      :scroll="{ y: 'calc(100vh - 300px)' }"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'content'">
          <span v-html="text"></span>
          <a
            v-if="!!record.redirect" class="!text-blue-600 ml-1"
            @click="handleRedirect(record.redirect)"
          >
            查看原委托
          </a>
        </template>
      </template>
    </a-table>
  </AppProvider>
</template>

<script lang="ts" setup>
import type { ILog } from '.'
import { openIlisTab } from '~/utils/openIlisTab'
import { columns } from '.'
import { getLogList } from './api'

const props = defineProps<{
  id?: string
  logType?: string
  relationQry?: boolean
  list?: ILog[]
}>()

const logTypeInner = ref(props.logType || '')

const idInner = ref(props.id || '')

const relationQry = ref(props.relationQry || false)

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
  const { data } = await getLogList(idInner.value, logTypeInner.value, relationQry.value)
  data.rows.forEach((d) => {
    if (d.remark) {
      const c = d.remark.split('#$#')
      if (c.length === 2) {
        const action = c[0]
        const info = c[1]
        if (action === 'redirect') {
          d.redirect = info
        }
        // return value + (top.addTabs ? `<a href="#" onclick="addTab('${encodeURIComponent(info)}')">查看原委托</a>` : '')
      }
    }
  })
  dataSource.value = data.rows
  loading.value = false
}

function handleRedirect(info: string) {
  try {
    const parInfo = JSON.parse(info)
    openIlisTab(parInfo.title, parInfo.url)
  }
  catch (err) {
    console.error(err)
  }
}

if (!props.list) {
  getList()
}
</script>
