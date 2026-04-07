<template>
  <div>
    <van-field
      v-model="displayName"
      readonly
      is-link
      label-align="left"
      input-align="right"
      v-bind="$attrs"
      @click-input="onOpen"
    />

    <van-action-sheet
      v-model:show="open"
      :actions="actions"
      :round="false"
      cancel-text="取消"
      close-on-click-action
      @select="onSelect"
    />
  </div>
</template>

<script setup lang='ts'>
import type { ActionSheetAction } from 'vant'
import { showToast } from 'vant'

const props = defineProps({
  value: String,
  options: Object as PropType<Array<string | {
    name: string
    value: string
  }>>,
})

const emits = defineEmits(['update:value', 'select'])

const actions = computed(() => {
  return (props.options || []).map(item => typeof (item) === 'string' ? { name: item, value: item } : item)
})

const value = computed(() => props.value)

const displayName = computed(() => {
  if (value.value) {
    const target = actions.value.find(i => i.value === value.value)

    if (target) {
      return target.name
    }
  }

  return ''
})

const open = ref(false)

function onOpen() {
  if (!actions.value.length) {
    showToast('没有可选项')
    return
  }

  open.value = true
}

function onSelect(action: ActionSheetAction) {
  emits('update:value', (action.value || action.name))
  emits('select', action)
}
</script>
