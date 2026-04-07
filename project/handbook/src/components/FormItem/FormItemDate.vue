<script setup lang='ts'>
import { computed, ref, useAttrs } from 'vue'
import DatePickerSelector from '../Selector/DatePickerSelector.vue'

const props = defineProps({
  value: String,
  enableTime: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:value'])

const attrs = useAttrs()

const value = computed(() => props.value)

const open = ref(false)

const disabled = computed(() => attrs.readonly || attrs.disabled)

function onOpen() {
  if (disabled.value)
    return

  open.value = true
}

function onClear() {
  emits('update:value', '')
}

function onSelect(val: string) {
  emits('update:value', val)
}
</script>

<template>
  <van-field
    v-model="value"
    :is-link="!disabled"
    v-bind="$attrs"
    readonly
    center
    @click-input="onOpen"
  >
    <template v-if="value" #button>
      <div style="display: flex;align-items: center;justify-content: center;">
        <van-icon name="close" style="font-size: 2rem;margin-right: 8px;" @click.stop="onClear()" />
      </div>
    </template>
  </van-field>

  <DatePickerSelector
    v-if="!disabled"
    v-model:show="open"
    :default-value="value"
    :enable-time="enableTime"
    @change="onSelect"
  />
</template>
