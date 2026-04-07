<template>
  <div
    class="h56 w56 flex-x justify-center rounded-full bg-white/60 shadow"
    @click="emit('change', !innerval)"
  >
    <div
      class="h43 w43 flex-x justify-center rounded-full transition-colors shadow"
      :class="{
        'bg-#0066ec': innerval,
      }"
    >
      <ElOff h14 w14 :class="[innerval ? 'text-white' : 'text-#9CABBE']"></ElOff>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'change', val: boolean): void
}>()

const innerval = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})
</script>
