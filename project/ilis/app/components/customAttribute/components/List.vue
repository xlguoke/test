<template>
  <div class="flex flex-col gap-2 h-full overflow-auto">
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
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :entity="CustomAttributeEntity"
        :loading="loading"
        :data-source="dataSource"
        :table-height="tableHeight"
        :field-list="fieldList"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow()"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'columnType'">
            {{ FORM_TYPE_DICT.getLabelByKey(record.columnType) }}
          </template>
          <template v-else-if="column.dataIndex === 'blind'">
            <a-tag v-if="!!record.blind" :bordered="false" color="success">
              盲样
            </a-tag>
            <a-tag v-else :bordered="false" color="error">
              不盲样
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'preVisible'">
            <div @click.stop="() => changeRowData(record as CustomAttributeEntity)">
              <a-switch :checked="record.preVisible" />
            </div>
          </template>
        </template>
      </IlisTable>
    </div>
    <AddEdit
      v-model:open="visible"
      :customize-type="customizeType"
      :column-name-list="columnNameList"
      :detail-data="detailData"
      :show-blind-col="showBlindCol"
      :show-pre-consign-col="showPreConsignCol"
      @save="refreshList"
    />
  </div>
</template>

<script setup lang='ts'>
import type { AddEditData, CustomColumn, Query } from '../api'
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { ref } from 'vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { CustomAttributeEntity, FORM_TYPE_DICT } from '../'
import { deleteApi, getCustomColumnApi, getPageList, saveApi } from '../api'
import AddEdit from './AddEdit.vue'

const props = defineProps({
  open: Boolean,
  /** 自定义属性类型 */
  customizeType: {
    type: String,
    required: true,
  },
  /** 自定义列属性：获取全部列，用于新增自定义属性时判断重复数据，与列筛选属性一致 */
  columnsType: {
    type: String,
    default: '',
  },
  /** 显示是否盲样 */
  showBlindCol: {
    type: Boolean,
    default: false,
  },
  /** 显示应用到预委托 */
  showPreConsignCol: {
    type: Boolean,
    default: false,
  },
})

const fieldList = computed(() => {
  let fields = CustomAttributeEntity.getTableFieldList()
  if (!props.showBlindCol) {
    fields = fields.filter(item => item !== 'blind')
  }
  if (!props.showPreConsignCol) {
    fields = fields.filter(item => item !== 'preVisible')
  }
  return fields
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
  getCustomRow,
} = useTableHooks<CustomAttributeEntity>({
  api: getPageList,
  query,
  payload: {
    customizeType: props.customizeType || '',
  },
  isPagination: false,
  responseDataTransform(res) {
    // 处理盲样列
    if (props.showBlindCol) {
      res.forEach((v: CustomAttributeEntity) => {
        const blind = Number.parseInt(v.columnName.substring(0, 1))
        v.blind = Number.isNaN(blind) ? 0 : blind
        if (!Number.isNaN(blind)) {
          v.columnName = v.columnName.substring(1)
        }
      })
    }
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

/**
 * 切换引用到预委托
 */
async function changeRowData(row: CustomAttributeEntity) {
  const data = { ...row } as AddEditData
  data.preVisible = !data.preVisible
  data.columnValue = row.columnValue ? row.columnValue.split(',') : []
  if (data.blind !== undefined) {
    data.columnName = `${data.blind}${data.columnName}`
  }
  try {
    loading.value = true
    await saveApi(data)
    message.success('修改成功')
    refreshList()
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}

defineExpose({
  selectedRows,
})
</script>

<style>

</style>
