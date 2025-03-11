<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    width="80%"
    title="检校计划"
    destroy-on-close
    :body-style="{ height: '80vh', overflowY: 'auto' }"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <a-button type="primary" @click="handleConfirm()">
        确定
      </a-button>
      <a-button @click="internalOpen = false">
        取消
      </a-button>
    </template>
    <PlanVue ref="planRef" />
  </a-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { PlanDeviceEntity } from './plan'
import PlanVue from './Plan.vue'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: PlanDeviceEntity[]): void
}>()

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

const planRef = ref()

async function handleConfirm() {
  const data = await planRef.value?.getSeletedPlanDevice() as PlanDeviceEntity[]
  if (!data?.length) {
    return message.warning('请选择设备')
  }
  emits('confirm', data)
}
</script>
