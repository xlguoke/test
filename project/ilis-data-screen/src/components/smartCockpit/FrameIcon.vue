<!-- 外面带个圈的icon小组件 -->
<template>
  <div
    class="frame-container flex items-center justify-center relative"
    :class="size === '140' ? 'w-140 h-140' : 'w-250 h-250'"
  >
    <slot>
      <img class="w-70 h-70 z-10 relative" :src="icon" alt="" />
    </slot>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    size?: "140" | "250"
  }>(),
  { size: "140" }
)
</script>

<style scoped>
.frame-container {
  position: relative;
}

.frame-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("@/assets/images/smartCockpit/iconFrame.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  animation: rotate 5s linear infinite;
}

.frame-container.active::before {
  background-image: url("@/assets/images/smartCockpit/iconFrame-1.png");
}
.frame-container.un-animation::before {
  background-image: url("@/assets/images/smartCockpit/iconFrame-2.png");
  animation: none;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
