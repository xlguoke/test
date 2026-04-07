<template>
  <ht-modal
    v-model:open="internalOpen"
    width="500px"
    title="设置时间"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <div>
        <a-button type="primary" @click="handleAdd">
          新增
        </a-button>
      </div>
      <div class="flex gap-3 w-full">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          show-index
          :loading="loading"
          :entity="EquipmentInspectTimeEntity"
          :data-source="dataSourceAll"
          :pagination="false"
          :table-height="tableHeight"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'time'">
              <IlisInput
                v-model="record.time"
                class=" w-full"
                field="time"
                :entity="EquipmentInspectTimeEntity"
              ></IlisInput>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                type="link"
                danger
                @click="handleDelete([record as EquipmentInspectTimeEntity])"
              >
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { EquipmentInspectTimeEntity } from '../EquipmentInspectTimeEntity'

const props = defineProps<IDialogPropsSelector<EquipmentInspectTimeEntity>>()

const internalOpen = ref(true)

const timeDataList = ref<EquipmentInspectTimeEntity[]>(props.checkedRows || [])

const {
  loading,
  dataSourceAll,
  tableHeight,
  handleDelete,
} = useLocalTableHooks<EquipmentInspectTimeEntity>({
  dataSource: timeDataList,
})

function handleAdd() {
  timeDataList.value.push(EquipmentInspectTimeEntity.fromJSON({ id: `${Date.now()}` }))
}

/**
 * # 确认
 */
function handleConfirm() {
  props.onConfirm(timeDataList.value.filter(i => i.time))
  internalOpen.value = false
}
</script>
