<template>
  <ht-modal
    v-model:open="visible"
    :title="param.title || '提示'"
    :loading="loading"
    :after-close="onClosed"
    @cancel="handeConfirm(-1)"
  >
    <component :is="param.msgVNode" v-if="param.msgVNode" />
    <span v-else>{{ param.tipMsg }}</span>
    <template #footer>
      <a-button @click="handeConfirm(0)">
        {{ btns[0] }}
      </a-button>
      <a-button v-if="btns[1]" type="primary" :disabled="loading" @click="handeConfirm(1)">
        {{ btns[1] }}
      </a-button>
      <a-button v-if="btns[2]" type="primary" :disabled="loading" @click="handeConfirm(2)">
        {{ btns[2] }}
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

export interface IConfirmTipProps {
  title?: string
  tipMsg?: string
  msgVNode?: VNode
  btnName?: [string, string, string]
  confirm?: (type: number, visible: Ref<boolean>, loading: Ref<boolean>) => void
}

const props = defineProps<IDialogPropsParam<number, IConfirmTipProps>>()
const visible = ref(true)
const loading = ref(false)

const btns = computed(() => {
  return props.param.btnName || ['取消', '保持', '更新']
})

function handeConfirm(type: number) {
  if (props.param.confirm) {
    props.param.confirm(type, visible, loading)
    return
  }
  visible.value = false
  props.onConfirm(type)
}
</script>

<style>

</style>
