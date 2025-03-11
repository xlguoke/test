<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    title="日志"
    destroy-on-close
    width="800px"
    :keyboard="false"
    :mask-closable="false"
    :body-style="{ height: '600px', overflowY: 'auto' }"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <LogList :id="id" :log-type="logType" />
  </a-modal>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  show: boolean
  id: string
  logType: string
}>(), { show: false })

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})
</script>
