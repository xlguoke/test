<template>
  <div class="flex items-center test-count cursor-pointer">
    <slot name="icon"></slot>
    <div class="ml-2">
      <div class="test-count-num w-[180px]">
        <slot></slot>
      </div>
      <div class="test-count-text">
        {{ title }}
      </div>
    </div>
    <img src="@/assets/images/commandCenterScreen/test-arrow.svg" class="ml-2" />
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
.test-count {
  .test-count-num {
    color: #0ee7e5;
    font-size: 40px;
    font-family: "YSFont";
  }

  .test-count-text {
    color: #92add4;
    font-size: 14px;
  }
}
</style>
