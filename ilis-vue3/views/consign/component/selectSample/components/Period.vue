<template>
  <div>
    <a-space v-if="!readonly && !isNoticeModifyConsign" class="mb-2">
      <a-button type="primary" @click="onAdd">
        添加
      </a-button>
      <a-button @click="onDel">
        删除
      </a-button>
    </a-space>

    <a-table
      row-key="index"
      size="small"
      :columns="columns"
      :data-source="list"
      :row-selection="rowSelection()"
      :pagination="false"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'testParamName'">
          <a-flex gap="middle" align="center" justify="space-between">
            <div>{{ record.testParamName }}</div>
            <a-button v-if="!readonly" size="samll" @click="onEdit(record.index)">
              选择
            </a-button>
          </a-flex>
        </template>
        <template v-if="column.dataIndex === 'periodCode'">
          <a-input v-model:value="record.periodCode" :placeholder="placeholder('请输入试件编号')" :disabled="readonly" />
        </template>
        <template v-if="column.dataIndex === 'formingDate'">
          <a-date-picker
            v-model:value="record.formingDate"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
            :placeholder="placeholder('请选择制样日期')"
            :disabled="readonly"
          />
        </template>
        <template v-if="column.dataIndex === 'days'">
          <a-input-number
            v-model:value="record.days"
            style="width: 100%;"
            :min="0"
            :placeholder="placeholder('请输入龄期')"
            :disabled="readonly"
          />
        </template>
        <template v-if="column.dataIndex === 'description'">
          <a-input v-model:value="record.description" :placeholder="placeholder('请输入制样情况')" :disabled="readonly" />
        </template>
      </template>
    </a-table>

    <PeriodAdd
      v-model:open="addVisible"
      :edit-period="editPeriod"
      @on-save="onAddPeriod"
      @on-update="onUpdatePeriod"
    />
  </div>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import PeriodAdd from './PeriodAdd.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { PeriodMetaDataItem, UsePeriod } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import { PeriodEntity } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'

const props = defineProps({
  dataSource: {
    type: PeriodEntity,
    required: true,
    default: new PeriodEntity(),
  },
})

// 制样信息/龄期
const usePeriod = inject('usePeriod') as UsePeriod
// 参数信息
const useTestParams = inject('useTestParams') as UseTestParams

const { readonly, placeholder, isNoticeModifyConsign } = usePageState()

const [addVisible, setAddVisible] = useStateHooks(false)
const [editIndex, setEditIndex] = useStateHooks(-1)

const selectedRowKeys = ref<PeriodMetaDataItem['index'][]>([])

const columns: ColumnsType = [
  { title: '制样参数', dataIndex: 'testParamName', width: '20%' },
  { title: '试件编号', dataIndex: 'periodCode', width: '20%' },
  { title: '制样日期', dataIndex: 'formingDate', width: '20%' },
  { title: '龄期（天）', dataIndex: 'days', width: '20%' },
  { title: '制样情况描述', dataIndex: 'description', width: '20%' },
]

const rowSelection = function () {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: number[]) => {
      selectedRowKeys.value = keys
    },
  }
}

const list = computed(() => {
  return props.dataSource?.periods
})

// 编辑数据
const editPeriod = computed(() => {
  if (editIndex.value !== -1) {
    return list.value[editIndex.value]
  }

  return null
})

/** 新增 */
const onAdd = function () {
  if (!useTestParams.selectedRows.length) {
    message.warning('请先选择样品参数！')
    return
  }

  setEditIndex(-1)
  setAddVisible(true)
}

/**
 * 编辑制样参数
 * 逻辑与新增差不多，只是去掉了一些字段
 */
const onEdit = function (index: number) {
  setEditIndex(index)
  setAddVisible(true)
}

/** 添加制件信息 */
const onAddPeriod = function (item: PeriodMetaDataItem) {
  usePeriod.addPeriods(item)
  // 清空表格勾选
  selectedRowKeys.value = []
}

/** 更新制样信息 */
const onUpdatePeriod = function (item: PeriodMetaDataItem) {
  usePeriod.updatePeriods(editIndex.value, item)
  // 清空表格勾选
  selectedRowKeys.value = []
}

/** 删除已选附加费用 */
const onDel = function () {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的制样信息')
    return
  }

  Modal.confirm({
    title: '删除提示',
    content: '确认删除选中制样信息？',
    onOk: () => {
      // 删除数据
      usePeriod.delPeriods(selectedRowKeys.value)
      // 清空表格勾选
      selectedRowKeys.value = []
    },
  })
}
</script>
