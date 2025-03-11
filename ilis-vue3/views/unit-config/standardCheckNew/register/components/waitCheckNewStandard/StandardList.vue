<template>
  <div class="h-full flex flex-col gap-2">
    <a-alert type="info" show-icon>
      <template #message>
        <div>1.只能引用本单位规程信息，若您没找到想要的规程，请前往“单位配置-规程管理”中找到该规程设置为“本单位规程”后再引用；</div>
        <div>2.若“单位配置-规程管理”中没有您想要的规程，请新增或同步系统规程，并设置为“本单位规程”后再引用；</div>
      </template>
    </a-alert>
    <a-flex justify="space-between" align="center">
      <ilis-form-search
        :entity="WaitCheckNewEntity"
        @reset="customHandleReset"
        @search="handleSearch"
      />
      <a-checkbox v-model:checked="showAllData" @change="changeShowAll">
        显示全部
      </a-checkbox>
    </a-flex>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <ilis-table
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :table-height="tableHeight"
        :entity="WaitCheckNewEntity"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'type'">
            {{ STANDARD_TYPE_DICT.getLabelByKey(text) }}
          </template>
          <template v-if="column.dataIndex === 'sourceType'">
            {{ text === SOURCE_TYPE.SYS ? '是' : '否' }}
          </template>
        </template>
      </ilis-table>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { waitCheckNewStandardList } from '../../api'
import { SOURCE_TYPE, STANDARD_TYPE_DICT, WaitCheckNewEntity } from '.'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps<{
  checkNewId: string
  standardTypeId: string
}>()

const showAllData = ref(false)
const query = ref({
  whetherThisUnit: '1',
})

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRowKeys,
  lastSearchParams,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<WaitCheckNewEntity>({
  api: waitCheckNewStandardList,
  query,
  totalKey: 'count',
  payload: {
    ...props,
  },
})

/**
 * 重置
 */
function customHandleReset(q: any) {
  if (showAllData.value) {
    query.value.whetherThisUnit = ''
  }
  else {
    query.value.whetherThisUnit = '1'
  }
  handleReset({ q, ...query.value })
}

/**
 * 显示全部数据
 */
function changeShowAll() {
  if (showAllData.value) {
    query.value.whetherThisUnit = ''
  }
  else {
    query.value.whetherThisUnit = '1'
  }
  handleSearch(query.value)
}

defineExpose({
  selectedRowKeys,
  queryParams: lastSearchParams,
})
</script>

<style>

</style>
