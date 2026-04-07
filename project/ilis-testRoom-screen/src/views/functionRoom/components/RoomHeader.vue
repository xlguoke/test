<template>
  <div class="test-room-title font-ys">{{ title }}</div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.test-room-title {
  background: linear-gradient(101deg, rgba(24, 144, 255, 0.09) 0%, rgba(24, 197, 255, 0.09) 100%),
    url("@/assets/images/title-bg.png") no-repeat;
  background-size: 90% 100%;
  background-position: center;
  border: 1px dashed rgba(24, 144, 255, 0.6);
  box-sizing: border-box;
  height: 1.7rem;
  line-height: 1.6rem;
  color: #bceaff;
  font-size: 0.68rem;
  text-align: center;
}

@media (max-width: 640px) {
  .test-room-title {
    font-size: 0.48rem;
  }
}
</style>
