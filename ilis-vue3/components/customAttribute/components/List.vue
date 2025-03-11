<template>
  <div class="flex flex-col gap-2 h-[70vh] overflow-auto">
    <IlisFormSearch
      :entity="CustomAttributeEntity"
      @reset="handleReset"
      @search="handleSearch"
    />
    <a-space>
      <a-button type="primary" :icon="h(PlusCircleOutlined)" @click="addEdit()">
        新增
      </a-button>
      <a-button :icon="h(EditOutlined)" @click="addEdit(true)">
        修改
      </a-button>
      <a-button danger :icon="h(DeleteOutlined)" @click="batchDelete">
        删除
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1">
      <IlisTable
        row-key="id"
        :entity="CustomAttributeEntity"
        :loading="loading"
        :data-source="dataSource"
        :table-height="tableHeight"
        :row-selection="getRowSelection()"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'columnType'">
            {{ FORM_TYPE_DICT.getLabelByKey(record.columnType) }}
          </template>
        </template>
      </IlisTable>
    </div>
    <AddEdit
      v-model:open="visible"
      :customize-type="customizeType"
      :column-name-list="columnNameList"
      :detail-data="detailData"
      @save="refreshList"
    />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { type CustomColumn, type Query, deleteApi, getCustomColumnApi, getPageList } from '../api'
import { CustomAttributeEntity, FORM_TYPE_DICT } from '../'
import AddEdit from './AddEdit.vue'
import { IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps({
  open: Boolean,
  /** 自定义属性类型 */
  customizeType: {
    type: String,
    required: true,
  },
  /** 自定义列属性：默认与自定义属性类型一致，不一样时单独传入 */
  columnsType: {
    type: String,
    default: '',
  },
})

const query = ref<Query>({
  customizeType: '',
})
const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRowKeys,
  selectedRows,
  getList,
  handleReset,
  handleSearch,
  getRowSelection,
} = useTableHooks<CustomAttributeEntity>({
  api: getPageList,
  query,
  payload: {
    customizeType: props.customizeType || '',
  },
  isPagination: false,
  responseDataTransform(res) {
    return {
      rows: res,
      total: res.length,
    }
  },
})

getCustomColumn()

function refreshList() {
  selectedRowKeys.value = []
  selectedRows.value = []
  getList()
}

const visible = ref(false)
const detailData = ref<CustomAttributeEntity>()
// 新增、修改
function addEdit(isEdit?: boolean) {
  detailData.value = undefined
  if (isEdit) {
    const n = selectedRows.value.length
    if (n === 0 || n > 1) {
      return message.warning('请选择一条数据进行修改')
    }
    detailData.value = selectedRows.value[0]
  }
  visible.value = true
}

// 删除
function batchDelete() {
  if (selectedRows.value.length === 0) {
    return message.warning('请选择要删除的数据')
  }
  Modal.confirm({
    title: '删除自定义属性确认！',
    content: '您确定要删除所选择的自定义属性吗？',
    onOk: async () => {
      const ids = selectedRowKeys.value.join(',')
      await deleteApi(ids)
      refreshList()
    },
  })
}

/**
 * 获取自定义列，用于列名称重复的判断
 */
const customColumns = ref<CustomColumn[]>([])
const columnNameList = computed(() => {
  const customList = customColumns.value.map(item => item.columnName)
  const list = dataSource.value.map(item => item.columnName)
  return [...customList, ...list]
})
function getCustomColumn() {
  const type = props.columnsType || props.customizeType
  getCustomColumnApi(type).then((res) => {
    customColumns.value = res.data
  })
}

defineExpose({
  selectedRows,
})
</script>

<style>

</style>
