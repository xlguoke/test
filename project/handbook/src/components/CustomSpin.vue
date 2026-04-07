<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isFixed: {
    type: Boolean,
    default: false,
  },
  // 高度撑满
  hFull: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const show = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== show.value)
    show.value = newVal
})

watch(() => show.value, (newVal) => {
  if (newVal !== props.modelValue)
    emit('update:modelValue', newVal)
})
</script>

<template>
  <div class="custom-spin" :class="[isFixed && show ? 'custom-spin-fixed' : '', hFull ? 'h-full' : '']">
    <van-overlay :class-name="['custom-spin-overlay']" :show="show" lock-scroll>
      <div class="custom-spin-wrapper">
        <van-loading vertical color="var(--primary-color)" />
      </div>
    </van-overlay>
    <div class="custom-spin-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.custom-spin{
  position: relative;
  &.h-full{
    height: 100%;
    .custom-spin-content {
      height: 100%;
      overflow-y: auto;
    }
  }
  &-overlay{
    position: absolute;
    background-color: unset;
    background-color: rgba(255, 255, 255, 0.5);
  }
  &-wrapper{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-fixed{
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    z-index: 1000 !important;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
