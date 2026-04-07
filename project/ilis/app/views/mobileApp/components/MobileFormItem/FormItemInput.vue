<template>
  <div>
    <van-field
      v-model="value"
      :right-icon="(enableSelection && !disabled) ? 'arrow' : undefined"
      label-align="left"
      input-align="right"
      v-bind="$attrs"
      @click-right-icon="onClickRight"
    >
      <template v-if="!disabled && $slots.rightIcon" #right-icon>
        <slot name="right-icon"></slot>
      </template>
      <template v-if="!disabled && $slots.button" #button>
        <slot name="button"></slot>
      </template>
      <template v-if="tip" #label>
        <div class="inline-flex items-center gap-1">
          <span>{{ attrs.label }}</span>
          <van-icon name="info-o" class="text-[#999]" @click.stop="showTip" />
        </div>
      </template>
    </van-field>

    <van-action-sheet
      v-if="enableSelection && !disabled"
      v-model:show="open"
      :actions="actions"
      :round="false"
      cancel-text="取消"
      close-on-click-action
      @select="onSelect"
    />

    <!-- tip 提示弹窗 -->
    <van-dialog
      v-model:show="tipVisible"
      :title="(attrs.label as string)"
      :message="tip"
      confirm-button-text="知道了"
      :show-cancel-button="false"
    />
  </div>
</template>

<script setup lang='ts'>
import type { ActionSheetAction } from 'vant'

const props = defineProps({
  value: [String, Number],
  options: Object as PropType<Array<string | {
    name: string
  }>>,
  tip: String,
})

const emits = defineEmits(['update:value'])

const attrs = useAttrs()

const enableSelection = computed(() => !!(props.options && props.options.length))

const actions = computed(() => {
  return (props.options || []).map(item => typeof (item) === 'string' ? { name: item } : item)
})

const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emits('update:value', val)
  },
})

const open = ref(false)
const tipVisible = ref(false)

const disabled = computed(() => attrs.readonly || attrs.disabled)

function showTip() {
  tipVisible.value = true
}

function onClickRight() {
  if (enableSelection.value) {
    open.value = true
  }
}

function onSelect(action: ActionSheetAction) {
  emits('update:value', action.name, action)
}
</script>
