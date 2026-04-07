<template>
  <ht-modal
    v-model:open="internalOpen"
    width="700px"
    title="选择关联检测合同"
    :loading="loading"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="min-h-[40vh]">
      <a-table
        row-key="id"
        :data-source="dataSource"
        :columns="columns"
        :pagination="false"
        :custom-row="customRow"
        :row-selection="{
          type: 'checkbox',
          selectedRowKeys,
          hideSelectAll: true,
        }"
        :scroll="{ y: '60vh' }"
      />
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import type { IAppointmentContractDTO } from '~/api/consign/consign-management/types'

const props = defineProps<IDialogPropsSelector<any>>()

const { param, consignFeeProcessor } = props.customParams as any

const internalOpen = ref(true)
const loading = ref(true)
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<IAppointmentContractDTO[]>([])
const dataSource = ref<IAppointmentContractDTO[]>([])
const columns = [
  {
    title: '合同名称',
    dataIndex: 'name',
  },
  {
    title: '合同编号',
    dataIndex: 'no',
  },
]

function taggleSelected(record: IAppointmentContractDTO) {
  if (record.id === selectedRowKeys.value[0]) {
    selectedRowKeys.value = []
    selectedRows.value = []
    return
  }
  selectedRowKeys.value = [record.id]
  selectedRows.value = [record]
}

function customRow(record: IAppointmentContractDTO) {
  return {
    onChange: () => {
      taggleSelected(record)
    },
    onClick: () => {
      taggleSelected(record)
    },
  }
}

async function getData() {
  loading.value = true
  dataSource.value = await consignFeeProcessor.loadAppointContract(param)
  loading.value = false
}

getData()

/**
 * # 确认
 */
function handleConfirm() {
  internalOpen.value = false
  props.onConfirm(selectedRows.value)
}
</script>
