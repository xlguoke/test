<template>
  <HtModal
    v-model:open="visible"
    title="详情"
    width="500px"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <IlisForm
      :key="initData.rentType"
      :cols="1"
      :entity="EquipmentInventoryPlanEntity"
      :init-data="initData"
    >
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { EquipmentInventoryPlanEntity } from '../EquipmentInventoryPlanEntity'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EquipmentInventoryPlanEntity>>()

const visible = ref(true)

const initData = ref<EquipmentInventoryPlanEntity>(props.param)

async function init() {
  if (props.param.id) {
  // keep
  }
}
init()
</script>
