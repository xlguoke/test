<template>
  <BaseSpinWrapper :spinning="loading">
    <IlisFormSearch
      :entity="MeasureDevideEntity"
      @search="handleSearch"
      @reset="handleReset"
    />
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        :entity="MeasureDevideEntity"
        :data-source="dataSource"
        :table-height="tableHeight"
        :pagination="getPagination()"
      >
      </IlisTable>
    </div>
  </BaseSpinWrapper>
</template>

<script setup lang='ts'>
import { useTableHooks } from '~/hooks/useTableHooks'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { MeasureDevideEntity } from '../MeasureDevideEntity'

async function getCollectionData(param: any) {
  return IlisApiHelper.get('rest/data/gather/measure/values/pages', param)
}

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getPagination,
} = useTableHooks({
  api: getCollectionData,
})
</script>

<style>

</style>
