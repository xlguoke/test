<script setup lang="ts">
import { LeftOutlined } from '@ant-design/icons-vue'

defineProps({
  hideLeft: Boolean,
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="title-bar-wrap">
    <div v-if="!hideLeft" class="title-bar-left">
      <slot name="left">
        <LeftOutlined @click="$router.go(-1)" />
      </slot>
    </div>
    <p class="title">
      {{ title || $route.meta.title }}
    </p>
    <div class="title-bar-right">
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.title-bar-wrap {
  position: fixed;
  top: 0;
  width: 100%;
  height: 45px;
  line-height: 45px;
  background: var(--primary-color);
  color: #fff;
  font-size: 18px;
  z-index: 1000;
  .title {
    text-align: center;
  }
  .title-bar-left {
    position: absolute;
    left: 2.5rem;
    top: 0;
    height: 100%;
  }
  .title-bar-right {
    position: absolute;
    right: 2.5rem;
    top: 0;
    height: 100%;
  }
}
</style>
