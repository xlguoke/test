<template>
  <div class="min-h-[50vh]">
    <ilis-table
      row-key="id"
      show-index
      :loading="loading"
      :data-source="dataSource"
      table-height="60vh"
      :field-list="StandardCheckNewRegisterEntity.getTableFieldList()?.filter(item => item !== 'action')"
      :entity="StandardCheckNewRegisterEntity"
      :pagination="getPagination()"
      @change="handleSortChange"
    >
    </ilis-table>
  </div>
</template>

<script setup lang='ts'>
import { recordListApi } from '../register/api'
import { StandardCheckNewRegisterEntity } from '../register/listEntity'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps<{
  id: string | number
}>()

const {
  loading,
  dataSource,
  getPagination,
  handleSortChange,
} = useTableHooks<StandardCheckNewRegisterEntity>({
  api: recordListApi,
  query: ref({
    standardCheckNewId: props.id,
  }),
  responseDataTransform: (res) => {
    res.rows.forEach((item: StandardCheckNewRegisterEntity) => {
      item.standardType = `${item.standardType}`
    })
    return res
  },
})
</script>

<style>

</style>
