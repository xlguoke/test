<template>
  <div class="p-2 -mx-[8px] -my-[12px]">
    <a-table
      row-key="id"
      :data-source="dataSource"
      :columns="customColumns"
      :loading="loading"
      :pagination="false"
      bordered
    />
  </div>
</template>

<script lang="ts" setup>
import type { ICustomColumns } from '~/hooks/useTableHooks'
import { useTableHooks } from '~/hooks/useTableHooks'
import { sampleListApi } from '../api'

const props = defineProps<{
  consignId: string
  customColumns: ICustomColumns[]
}>()

const query = ref({
  consignId: props.consignId,
})

const {
  loading,
  dataSource,
} = useTableHooks({
  api: sampleListApi,
  query,
  responseDataTransform(res) {
    return {
      rows: res,
      total: res.length,
    }
  },
})
</script>

<style>
.ant-table-wrapper .ant-table.ant-table-middle .ant-table-tbody .ant-table-wrapper:only-child .ant-table{
  margin-inline: 0 !important;
  margin-block: 0 !important;
}
</style>
