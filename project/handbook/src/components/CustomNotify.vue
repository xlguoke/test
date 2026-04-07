<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const showNotify = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== showNotify.value)
    showNotify.value = newVal
})

watch(() => showNotify.value, (newVal) => {
  if (newVal !== props.modelValue)
    emit('update:modelValue', newVal)
})
</script>

<template>
  <van-notify v-model:show="showNotify" v-bind="$attrs" type="primary" class-name="custom-notify">
    <div class="icon" style="margin-right: 8px;">
      <slot name="icon">
        <van-icon name="warning-o" />
      </slot>
    </div>
    <div>
      <div class="title">
        <slot name="title">
          <span>提示</span>
        </slot>
        <van-icon class="icon-close" name="close" @click="showNotify = false" />
      </div>
      <slot>
        提示消息
      </slot>
    </div>
  </van-notify>
</template>

<style scoped lang="less">

</style>
