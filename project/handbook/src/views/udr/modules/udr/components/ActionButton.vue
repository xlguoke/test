<script setup lang="ts">
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="action-button" :class="{ active }">
    <slot />
  </div>
</template>

<style lang="less" scoped>
.action-button {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
  font-size: 14px;
  word-break: keep-all;

  ::v-deep select {
    border: none;
    background: transparent;
    font-size: 14px;
    outline: none;
    cursor: pointer;
    height: 24px;
  }

  &.active {
    color: #0066EC;
    :deep(img) {
      filter: invert(39%) sepia(92%) saturate(749%) hue-rotate(200deg) brightness(93%) contrast(101%);
    }
  }

  &:active {
    opacity: 0.6;
  }
}
</style>
