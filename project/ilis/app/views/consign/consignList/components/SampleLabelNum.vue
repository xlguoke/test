<!-- 资产选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="param.title || '标签打印'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div v-if="param.describe" class="text-right text-[green]">
      注：标签数量为 0 或空时，该样品不打印{{ param.describe }}
    </div>
    <div class="min-h-[50vh]">
      <a-table
        row-key="id"
        table-height="60vh"
        :loading="loading"
        :columns="showColumns"
        :data-source="dataSource"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            {{ statusEnum[record.status] || "" }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-input-number
              v-if="record.processObjectId"
              v-model:value="record.operation"
              :min="0"
              :precision="0"
              :controls="false"
            />
            <span v-else>需完成委托后才能打印该样品</span>
          </template>
        </template>
      </a-table>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { ConsignSampleData } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getSampleByConsignApi } from '../api'

const props = defineProps<IDialogPropsParam<ConsignSampleData[], {
  title?: string
  describe?: string
  remained?: boolean // 是否为打印留样标签
  consignIds: string[]
}>>()
const internalOpen = ref(true)

const columns = [
  { title: '委托编号', dataIndex: 'consignCode' },
  { title: '样品编号', dataIndex: 'testObjectCode' },
  { title: '样品名称', dataIndex: 'testObjectName' },
  { title: '样品流转状态', dataIndex: 'status' },
  { title: '约定处理方式', dataIndex: 'sampleProcessMethod' },
  { title: '标签数量', dataIndex: 'operation', width: 100 },
]

const showColumns = computed(() => {
  if (props.param.remained)
    return columns
  return columns.filter((item) => {
    return !['status', 'sampleProcessMethod'].includes(item.dataIndex)
  })
})

const statusEnum: Record<string, string> = {
  '000': '待入库',
  '00': '待检',
  '0': '在检',
  '1': '收样处留样',
  '2': '测后留样',
  '3': '测后废弃',
  '4': '留样到期废弃',
  '5': '留样到期返还',
  '6': '提前废弃',
  '7': '提前返还',
  '8': '利用',
  '9': '提前利用',
  '10': '作废',
  '11': '分包',
  'default': '',
}

const {
  loading,
  dataSource,
} = useTableHooks<ConsignSampleData>({
  api: getSampleByConsignApi,
  payload: {
    consignIds: props.param.consignIds.toString(),
  },
  responseDataTransform(res) {
    const rows = res.obj || []
    return {
      rows,
      total: rows.length,
    }
  },
})

/**
 * # 确认
 */
function handleConfirm() {
  if (dataSource.value.length === 0)
    return message.warning('未找到需要打印的数据')

  const datas = dataSource.value.filter(d => !!d.operation)
  if (datas.length === 0)
    return message.warning('请设置需要打印的标签数量')

  props.onConfirm(datas)
  internalOpen.value = false
}
</script>
