<!-- 外部样品选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="数据中心数据查询"
    hide-confirm
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full min-h-[40vh]">
      <div class="flex gap-3 w-full">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          table-height="55vh"
          resizable
          :entity="DataCenterEntity"
          :data-source="dataSource"
        >
        </IlisTable>
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDataCenterForDebugModalParam } from './api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getDataCenterForDebugData } from './api'
import { DataCenterEntity } from './DataCenterEntity'

const props = defineProps<IDialogPropsParam<null, IDataCenterForDebugModalParam>>()

const internalOpen = ref(true)

const dataSource = asyncComputed<DataCenterEntity[]>(async () => {
  if (props.param?.tableData) {
    return props.param?.tableData
  }
  return await getData()
})

async function getData() {
  const { data } = await getDataCenterForDebugData(props.param)
  return data
}

/** # 确认 */
function handleConfirm() {
  props.onConfirm(null)
  internalOpen.value = false
}
</script>
