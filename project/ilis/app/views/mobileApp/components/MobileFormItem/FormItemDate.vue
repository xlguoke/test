<template>
  <div>
    <van-field
      v-model="value"
      :is-link="!disabled"
      label-align="left"
      input-align="right"
      v-bind="$attrs"
      readonly
      @click-input="onOpen"
    />

    <MobileDateSelector
      v-if="!disabled"
      v-model:open="open"
      :enable-time="enableTime"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang='ts'>
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'

const props = defineProps({
  value: String,
  enableTime: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:value', 'select'])

const attrs = useAttrs()

const value = computed(() => props.value)

const open = ref(false)

const disabled = computed(() => attrs.readonly || attrs.disabled)

function onOpen() {
  if (disabled.value) {
    return
  }

  open.value = true
}

function onSelect(val: string) {
  emits('update:value', val)
  emits('select', val)
}
</script>
