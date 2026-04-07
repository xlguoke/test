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
        :field-list="['custodian']"
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
import { getGuardianNameList } from '~/views/equipment/material/standard-material-ledger/api'
import { StandardMaterialLedgerEntity } from '~/views/equipment/material/standard-material-ledger/entity/StandardMaterialLedgerEntity'

const props = defineProps<IDialogPropsParam<any, Record<string, any>>>()

const {
  loading,
  tableHeight,
  tableBoxRef,
  dataSource,
  selectedRows,
  getRowSelection,
  getCustomRow,
} = useTableHooks<StandardMaterialLedgerEntity>({
  api: getGuardianNameList,
  payload: {
    pageNumber: 1,
    pageSize: 9999,
  },
  responseDataTransform(data) { // 保管人字符串数组
    return {
      rows: (data || []).map((item: any, index: any) => ({
        id: index,
        custodian: item,
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
    message.warning('请选择一个保管人')
    return
  }
  props.onConfirm([...selectedRows.value])
  visible.value = false
}

function handleCancel() {
  visible.value = false
}
</script>
