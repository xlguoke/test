<template>
  <ht-modal
    v-model:open="open"
    title="关联废物"
    width="800px"
    :mask-closable="false"
    @cancel="cancel"
  >
    <div style="background: #e5f3ff;" class="p-2">
      <div>1. 待选列表为化学废物管理-已提交列表中，状态为待处理的废物；</div>
      <div>2. 只能选择已选废物类型的废物；</div>
    </div>
    <a-space class="mt-4 mb-4">
      <a-range-picker v-model:value="createDate" :value-format="EDateFormatType.YYYY_MM_DD" :placeholder="['开始提交日期', '结束提交日期']" />
      <a-input v-model:value.trim="queryForm.quickQry" class="w-[220px]" placeholder="请输入功能室名称查询" :maxlength="100" />

      <a-button type="primary" @click="getList()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
    </a-space>

    <a-table
      row-key="id"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :row-selection="getRowSelection()"
      bordered
      :scroll="{
        y: 420,
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'type'">
          {{ getWasteTypeText(record.type) }}
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" @click="onSubmit">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type {
  ChemicalWasteDTO,
  GetChemicalWastePageParams,
} from '~/views/chemical/waste/reg/api.ts'
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useDateRangePickerHooks } from '~/hooks/useDatePickerHooks.ts'
import { PageStatusEnum } from '~/views/chemical/waste/reg'
import {
  getChemicalWastePage,
} from '~/views/chemical/waste/reg/api.ts'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'

const props = defineProps<IDialogPropsParam<null, {
  checkItems: ChemicalWasteDTO[]
  type: string
}>>()

const checkItems = computed(() => props.param.checkItems)

const open = ref(true)

const queryForm = ref<GetChemicalWastePageParams>({
  page: 1,
  size: 9999,
  status: PageStatusEnum.已提交,
  type: props.param.type,
  handleStatus: '1',
})

const selectedRowKeys = ref<string[]>(checkItems.value.map(i => i.id))

const selectedRows = ref<ChemicalWasteDTO[]>(checkItems.value)

const { getWasteTypeText } = useWasteRegHooks()

const columns = ref([
  { title: '功能室名称', dataIndex: 'laboratoryName' },
  { title: '废物类型', dataIndex: 'type' },
  { title: 'PH值', dataIndex: 'phValue', width: 100 },
  { title: '总数量', dataIndex: 'totalValue', width: 100 },
  { title: '提交人', dataIndex: 'submitUserName', width: 100 },
  { title: '提交时间', dataIndex: 'submitDate', customRender: ({ text }) => text ? dayjs(text).format(EDateFormatType.YYYY_MM_DD_HH_MM_SS) : '', width: 150 },
])

const dataSource = ref<ChemicalWasteDTO[]>([])

const [createDate] = useDateRangePickerHooks((val) => {
  queryForm.value.startDate = val[0] || ''
  queryForm.value.endDate = val[1] || ''
})

function getRowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows: ChemicalWasteDTO[]) => {
      selectedRows.value = rows
      selectedRowKeys.value = keys
    },
  }
}

getList()

async function getList() {
  const res = await getChemicalWastePage(queryForm.value)
  dataSource.value = res.data.rows
}

function onReset() {
  queryForm.value = {
    page: 1,
    size: 9999,
    status: PageStatusEnum.已提交,
    type: props.param.type,
    handleStatus: '1',
  }
  createDate.value = []
  getList()
}

function onSubmit() {
  if (!selectedRows.value.length) {
    Modal.info({
      title: '提示',
      content: '请勾选数据！',
    })
    return
  }

  props.onConfirm(unref(selectedRows.value))
  cancel()
}

// 关闭弹窗
function cancel() {
  open.value = false
}
</script>
