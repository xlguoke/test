<template>
  <div class="p-2 -mx-[8px]">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.dataIndex === 'testSampleDisplayName'">
          <span>{{ record.testSampleDisplayName }}</span>
          <span v-if="record.testSampleName">（{{ record.testSampleName }}）</span>
        </div>
        <div v-if="column.dataIndex === 'testObjectParams'">
          <span v-for="(item, index) in record.testObjectParams" :key="index">
            {{ item.testParamDisplayName }}{{ index !== record.testObjectParams.length - 1 ? '，' : '' }}
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import type { ICustomColumns } from '~/hooks/useTableHooks'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getSampleInfo } from '../api'

const props = defineProps<{
  testTaskId?: string
  testObjectId?: string
}>()

const query = ref({
  testTaskId: props.testTaskId,
  testObjectId: props.testObjectId,
})

const {
  loading,
  dataSource,
} = useTableHooks({
  api: getSampleInfo,
  query,
  responseDataTransform(res: any) {
    return {
      rows: res?.obj?.testObjects || [],
      total: res?.obj?.testObjects?.length || 0,
    }
  },
})

const columns = ref<ICustomColumns[]>([
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    width: 120,
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: 120,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: 120,
  },
  {
    title: '工程部位/用途',
    dataIndex: 'projectPartAndUse',
    width: 120,
  },
  {
    title: '试验参数',
    dataIndex: 'testObjectParams',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 120,
  },

])
</script>

<style scoped lang="less">
.ant-table-wrapper .ant-table.ant-table-middle .ant-table-tbody .ant-table-wrapper:only-child .ant-table{
  margin-inline: 0 !important;
  margin-block: 0 !important;
}
</style>
