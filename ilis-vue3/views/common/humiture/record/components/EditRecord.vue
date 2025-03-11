<template>
  <a-modal
    v-model:open="open"
    title="修改记录"
    width="80%"
    :mask-closable="false"
    destroy-on-close
    centered
    @cancel="cancel"
  >
    <a-space class="my-4">
      <a-select
        v-model:value="queryForm['laboratory.id']"
        allow-clear
        style="width: 240px;"
        placeholder="功能室"
        :options="laboratoryOptions"
      />
      <a-range-picker v-model:value="updateDate" class="w-full" value-format="YYYY-MM-DD" />
      <a-button type="primary" @click="onSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
    </a-space>

    <a-table
      row-key="id"
      :columns="columns"
      :data-source="dataSource"
      :row-selection="getRowSelection()"
      :pagination="getPagination()"
      :loading="loading"
      :scroll="{ y: 320 }"
    >
      <template #bodyCell="{ record, column, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'createDate'">
          {{ record.createDate ? dayjs(record.createDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
        </template>
        <template v-if="column.dataIndex === 'value'">
          <div v-html="parseOriginValue(record.value)"></div>
        </template>
        <template v-if="column.dataIndex === 'updateValue'">
          <div v-html="parseEditValue(record.value, record.updateValue)"></div>
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { ColumnType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import type {
  HumitureEditRecordDataItem,
  HumitureEditRecordListParams,
} from '~/views/common/humiture/record/api/getHumitureEditRecordList.ts'
import {
  getHumitureEditRecordList,
} from '~/views/common/humiture/record/api/getHumitureEditRecordList.ts'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '修改时间', dataIndex: 'createDate', width: 160 },
  { title: '修改人', dataIndex: 'createName', width: 100 },
  { title: '功能室', dataIndex: 'laboratoryName', width: 160 },
  { title: '原始值', dataIndex: 'value', width: 220 },
  { title: '修改值', dataIndex: 'updateValue', width: 220 },
]

const updateDate = ref([])

const open = computed(() => props.open)

const queryForm = ref<HumitureEditRecordListParams>({})

const { laboratoryOptions } = useLaboratoryOptionsHook()

const {
  loading,
  dataSource,
  getRowSelection,
  getPagination,
  handleSearch,
} = useTableHooks<HumitureEditRecordDataItem>({
  api: getHumitureEditRecordList,
  query: queryForm,
  immediate: false,
})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    onSearch()
  }
})

function onSearch() {
  queryForm.value.updateStartDate = updateDate.value ? updateDate.value[0] : undefined
  queryForm.value.updateEndDate = updateDate.value ? updateDate.value[1] : undefined

  handleSearch()
}

function onReset() {
  updateDate.value = []
  queryForm.value = {}
  handleSearch()
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  queryForm.value = {}
  updateDate.value = []
  dataSource.value = []
}

function parseOriginValue(str) {
  try {
    const data = JSON.parse(str)
    const content = `
      <p>巡查时间：${data.recordDate || ''}</p>
      <p>巡查温度(℃)：${data.tem || ''}</p>
      <p>巡查湿度(%RH)：${data.hum || ''}</p>
    `
    return content
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return str
  }
}

function parseEditValue(str, updateStr) {
  try {
    const data = JSON.parse(str)
    const updateData = JSON.parse(updateStr)
    const content = `
      <p>巡查时间：<span class="${data.recordDate !== updateData.recordDate ? 'text-red-500' : ''}">${updateData.recordDate || ''}</span></p>
      <p>巡查温度(℃)：<span class="${data.tem !== updateData.tem ? 'text-red-500' : ''}">${updateData.tem || ''}</span></p>
      <p>巡查湿度(%RH)：<span class="${data.hum !== updateData.hum ? 'text-red-500' : ''}">${updateData.hum || ''}</span></p>
    `
    return content
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return updateStr
  }
}
</script>
