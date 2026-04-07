<template>
  <HtModal
    v-model:open="visible"
    title="详情"
    width="80%"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button type="primary" @click="visible = false">
        确定
      </a-button>
    </template>
    <Detail :id="param.data.id" :type="param.type"></Detail>
  </HtModal>
</template>

<script lang="ts" setup>
import type { EquipmentAllotApplyEntity } from '../EquipmentAllotApplyEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { AllotType } from '~/enum/AllotType'
import Detail from './Detail.vue'

defineProps<IDialogPropsParam<null, { type: AllotType, data: EquipmentAllotApplyEntity }>>()

const loading = ref(false)

const visible = ref(true)
</script>
