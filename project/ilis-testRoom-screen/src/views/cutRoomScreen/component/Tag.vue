<template>
  <van-tag :show="show" closeable size="medium" type="warning" plain @close="close">
    <slot></slot>
  </van-tag>
</template>
<script lang="ts" setup>
import { ref } from "vue"

const show = ref(true)
const close = () => {
  show.value = false
}
</script>
