<template>
  <div class="flex flex-col h-full gap-3 relative">
    <a-space>
      <a-input
        v-model:value="searchKeyword"
        placeholder="搜索参数名称"
        allow-clear
      />
      <a-button type="primary" @click="handleSearch">
        查询
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <a-table
        :columns="columns"
        :data-source="tableDataSource"
        :row-key="(record: ITestParamDTO) => record.id"
        :row-selection="getRowSelection({
          type: 'checkbox',
        })"
        :custom-row="getCustomRow()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      />
    </div>

    <a href="javascript:void(0);" :class="`text-[var(--colorPrimary)] ${useRowsData ? '' : 'absolute bottom-0 left-0'}` " @click="showSelectedParams">
      已选{{ selectedRowKeys.length }}个参数
    </a>

    <!-- 已选参数弹窗 -->
    <ht-modal
      v-model:open="selectedParamsModalOpen"
      title="已选择的参数"
      width="600px"
    >
      <div class="min-h-[300px]">
        <a-table
          :columns="selectedParamsColumns"
          :data-source="selectedRows"
          :row-key="(record: ITestParamDTO) => record.id"
          :pagination="false"
          :scroll="{ y: 'calc(100vh - 360px)' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button
                type="link"
                danger
                @click="removeSelectedParam(record.id)"
              >
                删除
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
      <template #footer>
        <a-button @click="clearSelectedParams">
          清空选择
        </a-button>
        <a-button @click="selectedParamsModalOpen = false">
          关闭
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script setup lang="ts">
import type { ITestParamDTO } from '~/api/unit-config/test-param/types'
import { useDebounceFn } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { getTestParamListApi } from '~/api/unit-config/test-param'
import { useTableHooks } from '~/hooks/useTableHooks'

/**
 * # 参数选择器组件
 * 用于选择测试参数，支持多选和搜索
 */

interface Props {
  rows?: ITestParamDTO[]
  bigCategoryId?: string
  paramVersionId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:selectedIds', ids: string[]): void
  (e: 'update:selectedParams', params: ITestParamDTO[]): void
  (e: 'change', data: { ids: string[], params: ITestParamDTO[] }): void
}>()

/** 搜索关键词 */
const searchKeyword = ref('')

/** 列定义 */
const columns = [
  {
    title: '参数名称',
    dataIndex: 'name',
    width: 80,
  },
  {
    title: '系统检测项目',
    dataIndex: 'testItemName',
    width: 100,
  },
]

/** 已选参数弹窗列定义 */
const selectedParamsColumns = columns.concat([
  {
    title: '操作',
    width: 50,
    dataIndex: 'action',
  },
])

/** 已选参数弹窗控制 */
const selectedParamsModalOpen = ref(false)

/** 是否使用props.rows数据 */
const useRowsData = computed(() => props.rows && props.rows.length > 0)

/** 过滤后的参数列表（当使用props.rows时） */
const filteredRowsList = computed(() => {
  if (!props.rows)
    return []
  if (!searchKeyword.value) {
    return props.rows
  }
  const keyword = searchKeyword.value.toLowerCase()
  return props.rows.filter(item =>
    item.name?.toLowerCase().includes(keyword)
    || item.testItemName?.toLowerCase().includes(keyword),
  )
})

/** 表格hooks配置 */
const {
  loading,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch: handleTableSearch,
  getList,
  selectedRowKeys,
  dataSource,
  selectedRows,
} = useTableHooks<ITestParamDTO>({
  api: getTestParamListApi,
  query: ref({
    name: searchKeyword,
  }),
  payload: {
    'bigCategory.id': props.bigCategoryId,
    'bigCategory.paramVersionId': props.paramVersionId,
  },
  sizeKey: 'rows',
  isPagination: !useRowsData.value,
  isCacheSelect: true,
  immediate: false, // 手动控制初始化
})

/** 表格数据源 */
const tableDataSource = computed(() => {
  return useRowsData.value ? filteredRowsList.value : dataSource.value
})

/**
 * # 处理选择变化（节流）
 */
const handleSelectionChange = useDebounceFn(() => {
  const selectedKeys = selectedRowKeys.value as string[]
  const params = selectedRows.value

  emit('update:selectedIds', selectedKeys)
  emit('update:selectedParams', params)
  emit('change', { ids: selectedKeys, params })
}, 300)

watch(() => selectedRowKeys.value, () => {
  handleSelectionChange()
}, { deep: true })

/**
 * # 显示已选参数弹窗
 */
function showSelectedParams() {
  selectedParamsModalOpen.value = true
}

/**
 * # 移除已选参数
 */
function removeSelectedParam(id: string) {
  // 从选中的参数中移除
  const index = selectedRowKeys.value.indexOf(id)
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1)
  }

  // 从选中的行数据中移除
  const rowIndex = selectedRows.value.findIndex(row => row.id === id)
  if (rowIndex > -1) {
    selectedRows.value.splice(rowIndex, 1)
  }

  // 触发选择变化事件
  handleSelectionChange()
}

/**
 * # 清空已选参数
 */
function clearSelectedParams() {
  selectedRowKeys.value = []
  selectedRows.value = []
  handleSelectionChange()
  selectedParamsModalOpen.value = false
}

/**
 * # 处理搜索
 */
function handleSearch() {
  if (useRowsData.value) {
    // 使用本地数据时，filteredRowsList 会自动计算
    // 触发一次选择变化，确保缓存更新
    handleSelectionChange()
  }
  else {
    // 使用接口数据时，调用表格搜索
    handleTableSearch({ name: searchKeyword.value })
  }
}

/**
 * # 加载参数列表
 */
async function loadParamList() {
  if (useRowsData.value) {
    // 使用本地数据
    // 默认选中第一项
    selectedRowKeys.value = [props.rows![0].id]
    selectedRows.value = [props.rows![0]]
  }
  else {
    // 使用接口数据
    await getList()
    if (dataSource.value.length > 0) {
      // 默认选中第一项
      selectedRowKeys.value = [dataSource.value[0].id]
      selectedRows.value = [dataSource.value[0]]
      handleSelectionChange()
    }
  }
}

onMounted(() => {
  loadParamList()
})
</script>
