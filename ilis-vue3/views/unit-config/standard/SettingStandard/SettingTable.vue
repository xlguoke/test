<template>
  <a-flex vertical class="h-full">
    <a-flex justify="space-between" align="center">
      <BaseTitle>{{ title }}</BaseTitle>
      <a-button class="mb-4" :disabled="isEmptyBasis" @click="setSelectedStandardVisible(true)">
        选择规程
      </a-button>
    </a-flex>

    <div ref="tableBoxRef" class="flex-1 overflow-auto">
      <a-table
        bordered
        row-key="uniqueKey"
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :row-selection="getRowSelection()"
        :custom-row="customRow"
        :scroll="{ y: tableHeight }"
        children-column-name="notChildren"
        :locale="{
          emptyText: isEmptyBasis ? '请先选择评定标准' : '暂无数据',
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'clauseCode'">
            <a-input v-model:value="record.clauseCode" placeholder="条款号" />
          </template>
          <template v-if="column.dataIndex === 'selected'">
            <a-switch
              v-model:checked="record.selected"
              checked-children="是"
              un-checked-children="否"
            />
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <CopyOutlined
              v-if="standardType === STANDARD_TYPE.BASIS"
              title="应用到其他评定标准"
              class="text-blue-500 text-lg cursor-pointer mr-2"
              @click.stop="onUse2Other(record)"
            />
            <DeleteOutlined title="删除" class="text-red-500 text-lg cursor-pointer" @click.stop="onDel(record)" />
          </template>
        </template>
      </a-table>
    </div>

    <!-- 选择规程 -->
    <SelectedStandard v-model:open="selectedStandardVisible" @select="handleAddStandardCallback" />
  </a-flex>
</template>

<script setup lang='ts'>
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'
import { Modal } from 'ant-design-vue'
import { STANDARD_TYPE, STANDARD_TYPE_DICT, SelectedStandard } from '~/views/unit-config/standard/index.ts'
import { useTableHeight } from '~/hooks/useTableHeight.ts'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { DataSource } from '~/views/unit-config/standard/api.ts'

const props = defineProps({
  type: {
    type: String as PropType<STANDARD_TYPE>,
    default: null,
  },
  selectedStandardKey: {
    type: String,
    default: null,
  },
  dataSource: {
    type: Array as PropType<DataSource[]>,
    default: () => [],
  },
  enableClauseCode: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['onSelectStandard', 'onUse2Other'])

const standardType = computed(() => props.type)

const title = computed(() => standardType.value === STANDARD_TYPE.STANDARD ? '评定标准' : '检测依据')

const isEmptyBasis = computed(() => standardType.value === STANDARD_TYPE.BASIS && !props.selectedStandardKey)

const columns = computed(() => {
  const c = [
    { title: '规程名称', dataIndex: 'standardName' },
    { title: '设为默认', dataIndex: 'selected', width: 150 },
    { title: '操作', dataIndex: 'action', width: 80 },
  ]

  if (props.enableClauseCode) {
    c.splice(1, 0, { title: '条款号', dataIndex: 'clauseCode', width: 150 })
  }

  return c
})

const { tableHeight, tableBoxRef } = useTableHeight()

const [selectedStandardVisible, setSelectedStandardVisible] = useStateHooks(false)

const loading = ref(false)

const dataSource = computed(() => props.dataSource)

const selectedRowKeys = ref<string[]>([])

function getRowSelection() {
  if (standardType.value === STANDARD_TYPE.BASIS) {
    return null
  }

  return {
    type: 'radio',
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[]) => {
      selectedRowKeys.value = keys
      emits('onSelectStandard', selectedRowKeys.value)
    },
  }
}

function customRow(record: DataSource) {
  if (standardType.value === STANDARD_TYPE.BASIS) {
    return null
  }

  return {
    onClick: () => {
      selectedRowKeys.value = [record.uniqueKey]
      emits('onSelectStandard', selectedRowKeys.value)
    },
  }
}

function checkAddStandardType(rows: DataSource[], cb) {
  const notMatchList = rows.filter(i => i.type !== standardType.value && i.type !== STANDARD_TYPE.ALL)
  if (notMatchList.length > 0) {
    const typename = standardType.value === STANDARD_TYPE.BASIS ? '评定标准' : '检测依据'
    const names = notMatchList.map(i => i.standardName + (i.publishCode || ''))

    Modal.confirm({
      title: '规程类型不匹配！',
      content: `您正在为检测参数[参数名称]选择“${STANDARD_TYPE_DICT.getLabelByKey(standardType.value)}”，您当前选择的规程${names.join(',')}为${typename}，是否继续添加？`,
      onOk: () => {
        cb()
      },
    })
  }
  else {
    cb()
  }
}

function handleAddStandardCallback(rows: DataSource[]) {
  checkAddStandardType(rows, () => {
    rows.forEach((item) => {
      if (!dataSource.value.find(i => i.uniqueKey === item.uniqueKey)) {
        if (standardType.value === STANDARD_TYPE.STANDARD) {
          item.children = []
        }
        item.selected = false
        dataSource.value.push(item)
      }
    })
    selectedStandardVisible.value = false
  })
}

function onDel(record: DataSource) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: () => {
      const index = dataSource.value?.findIndex(i => i.uniqueKey === record.uniqueKey)
      if (index !== -1) {
        dataSource.value?.splice(index, 1)
      }
    },
  })
}

function onUse2Other(record: DataSource) {
  emits('onUse2Other', { ...record })
}
</script>
