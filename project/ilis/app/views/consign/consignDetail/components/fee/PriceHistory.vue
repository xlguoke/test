<!-- 选择委托单位、工程项目、委托人 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="800px"
    title="费用历史"
    hide-confirm
    :after-close="onClosed"
  >
    <div class="h-[50vh]">
      <iframe id="feeHistory" :src="iframeSrc" frameborder="0" class="w-full h-full"></iframe>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface DialogProp {
  priceObjId: string
}

const props = defineProps<IDialogPropsParam<any, any>>()

const internalOpen = ref(true)
const iframeSrc = ref('')
const { priceObjId } = props.param as DialogProp

async function init() {
  iframeSrc.value = `feeModelController.do?goConsignFeeDetail&id=${priceObjId}`
}

onMounted(() => {
  init()
})
</script>
