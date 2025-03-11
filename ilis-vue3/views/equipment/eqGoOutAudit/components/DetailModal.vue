<template>
  <ht-modal
    v-model:open="visible"
    title="详情"
    width="1000px"
    :after-close="onClosed"
    @cancel="cancel"
  >
    <Detail :id="param.id" />
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { EqGoOutAuditEntity } from '../'
import Detail from './Detail.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

defineProps<IDialogPropsParam<null, EqGoOutAuditEntity>>()

const visible = ref(true)

function cancel() {
  visible.value = false
}
</script>

<style>

</style>
