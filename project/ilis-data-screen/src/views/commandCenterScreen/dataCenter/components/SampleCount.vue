<template>
  <div class="flex items-center data-center-sample-item">
    <slot name="icon"></slot>
    <div class="ml-16">
      <div class="data-center-sample-text">
        {{ title }}
      </div>
      <div class="data-center-sample-num">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const props = defineProps({
  title: {
    type: String,
    default: ""
  }
})

const title = ref(props.title)
</script>

<style lang="less" scoped>
.data-center-sample-item {
  width: 50%;

  .data-center-sample-text {
    font-size: 0.14rem;
    color: #c6dcea;
  }

  .data-center-sample-num {
    font-size: 0.18rem;
    color: #fff;
  }
}
</style>
