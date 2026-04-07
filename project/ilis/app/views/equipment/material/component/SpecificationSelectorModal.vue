<template>
  <HtModal
    v-model:open="visible"
    title="选择规格型号"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div ref="tableBoxRef" class="flex flex-col gap-4">
      <IlisTable
        row-key="id"
        bordered
        :loading="loading"
        :entity="StandardMaterialLedgerEntity"
        :field-list="['specification']"
        :data-source="dataSource"
        :pagination="false"
        :row-selection="
          getRowSelection({
            type: 'radio',
            columnWidth: 10,
          })"
        :custom-row="getCustomRow()"
        :table-height="tableHeight"
      />
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getStandardMaterialLedgerList } from '~/views/equipment/material/standard-material-ledger/api'
import { StandardMaterialLedgerEntity } from '~/views/equipment/material/standard-material-ledger/entity/StandardMaterialLedgerEntity'
import { useCommonData } from '../composables/useCommonData'

const props = defineProps<IDialogPropsParam<any, Record<string, any>>>()

const { initData } = useCommonData()

const {
  loading,
  tableHeight,
  tableBoxRef,
  dataSource,
  selectedRows,
  getRowSelection,
  getCustomRow,
} = useTableHooks<StandardMaterialLedgerEntity>({
  api: getStandardMaterialLedgerList,
  responseDataTransform: (data) => {
    return {
      rows: (data.content || []).map((item: any, index: any) => ({
        specification: item.specification,
        id: index,
      })),
      total: data.totalElements || 0,
    }
  },
  pageKey: 'pageNumber',
  sizeKey: 'pageSize',
})

const visible = ref(true)

function handleOk() {
  if (!selectedRows.value.length) {
    message.warning('请选择一个规格型号')
    return
  }
  props.onConfirm([...selectedRows.value])
  visible.value = false
}

function handleCancel() {
  visible.value = false
}

onMounted(async () => {
  await initData()
})
</script>
