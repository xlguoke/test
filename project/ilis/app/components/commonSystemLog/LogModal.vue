<template>
  <ht-modal
    v-model:open="internalOpen"
    centered
    title="日志"
    width="800px"
    destroy-on-close
    hide-confirm
  >
    <div class="min-h-[50vh]">
      <LogList :id="id" :log-type="logType" :relation-qry="relationQry" />
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  show: boolean
  id: string
  logType: string
  relationQry?: boolean
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
