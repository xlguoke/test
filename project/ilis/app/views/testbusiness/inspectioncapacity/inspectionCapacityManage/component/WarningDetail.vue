<template>
  <a-table
    :columns="type === warningType.TEST_PERSON ? columns_person : columns_equipment"
    :data-source="dataSource"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'dateRange'">
        {{ dayjs(record.useDateStart).format('YYYY-MM-DD') }} ~ {{ dayjs(record.useDateEnd).format('YYYY-MM-DD') }}
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import type { IWawningDetail } from '../CapacityEntity'
import dayjs from 'dayjs'
import { warningType } from '../CapacityEntity'

const props = defineProps({
  type: { // 预警类型
    type: String,
    default: warningType.EQUIPMENT,
  },
  initData: {
    type: Array as PropType<IWawningDetail[]>,
    default: () => ([]),
  },
})
const dataSource = ref<IWawningDetail[]>([])
watch(() => props.initData, (newVal) => {
  dataSource.value = newVal
})

const columns_person = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 50,
    customRender: ({ index }: { index: number }) => index + 1,
  },
  {
    title: '报告编号',
    dataIndex: 'reportSn',
    width: 150,
  },
  {
    title: '人员类型',
    dataIndex: 'objectRemark',
    width: 150,
  },
  {
    title: '人员名称',
    dataIndex: 'objectName',
    width: 150,
  },
  {
    title: '试验日期',
    dataIndex: 'dateRange',
    width: 150,
  },
]

const columns_equipment = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 50,
    customRender: ({ index }: { index: number }) => index + 1,
  },
  {
    title: '报告编号',
    dataIndex: 'reportSn',
    width: 150,
  },
  {
    title: '设备名称',
    dataIndex: 'objectName',
    width: 150,
  },
  {
    title: '设备编号',
    dataIndex: 'objectRemark',
    width: 150,
  },
  {
    title: '使用日期',
    dataIndex: 'dateRange',
    width: 150,
  },
]
</script>
