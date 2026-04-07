<template>
  <a-textarea
    v-model:value="stringValue"
    placeholder="请输入确认结论"
    :rows="4"
    :disabled="isReadonly"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  conclusionInfo: string
}>()

const emit = defineEmits<{
  (e: 'update:conclusionInfo', val: string): void
}>()

const isReadonly = inject('isReadonly')

const stringValue = computed({
  get: () => props.conclusionInfo,
  set: (val) => {
    emit('update:conclusionInfo', val)
  },
})
</script>
