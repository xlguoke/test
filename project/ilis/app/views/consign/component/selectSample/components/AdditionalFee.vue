<template>
  <div>
    <a-space v-if="!pageState.isDetailPage && !pageState.isNoticeModifyConsign" class="mb-2">
      <a-button type="primary" @click="setSelectVisible(true)">
        选择费用
      </a-button>
      <a-button @click="onDel">
        删除
      </a-button>
    </a-space>

    <a-table
      row-key="id"
      size="small"
      :columns="columns"
      :data-source="list"
      :row-selection="rowSelection()"
      :pagination="false"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'count'">
          <a-input-number
            v-model:value="record.count"
            :min="1"
            :disabled="pageState.isDetailPage"
            class="w-full"
          />
        </template>
        <template v-if="column.dataIndex === 'remark'">
          <a-input v-model:value="record.remark" :disabled="pageState.isDetailPage" />
        </template>
      </template>
    </a-table>

    <AdditionalFeeMgt v-model:open="selectVisible" @on-select="onSelectAdditionalFee" />
  </div>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { AdditionalFeeItem, AdditionalFeeMetaDataItem, UseAdditionalFee } from '../modules/UseAdditionalFee'
import { message, Modal } from 'ant-design-vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { AdditionalFeeEntity } from '../modules/UseAdditionalFee'
import AdditionalFeeMgt from './AdditionalFeeMgt.vue'

const props = defineProps({
  dataSource: {
    type: AdditionalFeeEntity,
    required: true,
    default: new AdditionalFeeEntity(),
  },
})

// 附加费用
const useAdditionalFee = inject('useAdditionalFee') as UseAdditionalFee

const [selectVisible, setSelectVisible] = useStateHooks(false)

const selectedRowKeys = ref<AdditionalFeeMetaDataItem['id'][]>([])

const { pageState } = useAdditionalFee.consginPageParam

const columns: ColumnsType = [
  { title: '附加费用名称', dataIndex: 'name', width: '20%' },
  { title: '单价（元）', dataIndex: 'price', width: '20%' },
  { title: '单位', dataIndex: 'priceUnit', width: '20%' },
  { title: '数量', dataIndex: 'count', width: '20%' },
  { title: '备注', dataIndex: 'remark', width: '20%' },
]
function rowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: any[]) => {
      selectedRowKeys.value = keys
    },
  }
}

const list = computed(() => {
  return props.dataSource?.additionalFees
})

/** 选择附加费用 */
function onSelectAdditionalFee(rows: AdditionalFeeItem[]) {
  const data: AdditionalFeeMetaDataItem[] = rows.map(item => ({
    ...item,
    count: 1,
  }))

  // 保存已选费用数据
  useAdditionalFee.setDataField('additionalFees', data)
  // 清空表格勾选
  selectedRowKeys.value = []
}

/** 删除已选附加费用 */
function onDel() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的附加费用')
    return
  }

  Modal.confirm({
    title: '删除提示',
    content: '确认删除选中附加费用？',
    onOk: () => {
      // 删除数据
      useAdditionalFee.delAdditionalFee(selectedRowKeys.value)
      // 清空表格勾选
      selectedRowKeys.value = []
    },
  })
}
</script>
