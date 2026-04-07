<!-- 外部样品选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="param.title || '批量编辑外来样品信息'"
    :after-close="onClosed"
    @cancel="handleConfirm(false)"
    @ok="handleConfirm(true)"
  >
    <div class="flex flex-col min-h-[40vh]">
      <IlisTable
        row-key="id"
        table-height="55vh"
        :entity="EditMixingAmountEntity"
        :data-source="dataSource"
        :pagination="false"
        :field-order="filedOrder"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="!filedOrder.includes(column.dataIndex as string)">
            <a-input v-model:value="record[column.dataIndex as string]"></a-input>
          </template>
        </template>
      </IlisTable>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ExternalObjectEntity } from '~/components/selectorViaMethodCall/entity/ExternalObjectEntity'
import { cloneDeep } from '@unovis/ts'
import { EditMixingAmountEntity } from '~/components/selectorViaMethodCall/entity/MixingAmountEntity'

const props = defineProps<IDialogPropsParam<ExternalObjectEntity[] | null, {
  title?: string
  datas: ExternalObjectEntity[]
}>>()

const internalOpen = ref(true)

const dataSource = ref<ExternalObjectEntity[]>([])

const filedOrder = ['testSampleDisplayName', 'standard']

onMounted(() => {
  dataSource.value = cloneDeep(props.param.datas || [])
})

/** # 确认 */
function handleConfirm(ok: boolean) {
  props.onConfirm(ok ? dataSource.value : null)
  internalOpen.value = false
}
</script>
