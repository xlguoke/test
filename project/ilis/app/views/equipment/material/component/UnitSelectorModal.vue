<template>
  <HtModal
    v-model:open="visible"
    title="选择计量单位"
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
        :field-list="['unit']"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection({ type: 'radio', columnWidth: 10 })"
        :custom-row="getCustomRow()"
        :table-height="tableHeight"
      />
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { getDictByCode } from '~/api/common.ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import { StandardMaterialLedgerEntity } from '../standard-material-ledger/entity/StandardMaterialLedgerEntity'

const props = defineProps<IDialogPropsParam<any, Record<string, any>>>()

const {
  loading,
  tableHeight,
  tableBoxRef,
  dataSource,
  selectedRows,
  getRowSelection,
  getPagination,
  getCustomRow,
} = useTableHooks<StandardMaterialLedgerEntity>({
  // 包装函数：接收对象参数，提取id后调用原接口
  api: async (params: Record<string, any>) => {
    // 从params中提取id，调用实际接口
    const id = params.id || 'sampleAmountUnit'
    return await getDictByCode(id)
  },
  payload: {
    id: 'sampleAmountUnit',
  },
  responseDataTransform: (data) => {
    return {
      total: (data || []).length,
      rows: (data || []).map((item: any) => ({
        id: item.typeCode,
        unit: item.typeName,
      })),
    }
  },
})

const visible = ref(true)

function handleOk() {
  if (!selectedRows.value.length) {
    message.warning('请选择一个计量单位')
    return
  }
  props.onConfirm([...selectedRows.value])
  visible.value = false
}

function handleCancel() {
  visible.value = false
}
</script>
