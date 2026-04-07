<template>
  <div>
    <div
      class="baseToggleBar relative w-[32px] h-[72px] cursor-pointer"
      @click="value = !value"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <!-- top -->
      <div
        class="w-[4px] rounded-[2px] h-[38px] transition-all absolute left-1/2 bg-[var(--colorBorder)] shadow-md"
        :class="topComputedClass"
      ></div>
      <!-- bottom -->
      <div
        class="w-[4px] rounded-[2px] h-[38px] transition-all absolute top-[34px] left-1/2 bg-[var(--colorBorder)] shadow-md"
        :class="bottomComputedClass"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const value = defineModel<boolean>()

/** # 是否处于鼠标悬停状态 */
const isHovering = ref(false)

const topComputedClass = computed(() => {
  if (isHovering.value && value.value) {
    return 'transform -rotate-[12deg] translate-y-[-2px] scale-[1.1] bg-[#999]'
  }
  if (isHovering.value && !value.value) {
    return 'transform rotate-[12deg] translate-y-[-2px] scale-[1.1] bg-[#999]'
  }
  return ''
})

const bottomComputedClass = computed(() => {
  if (isHovering.value && value.value) {
    return 'transform rotate-[12deg] translate-y-[2px] scale-[1.1] bg-[#999]'
  }
  if (isHovering.value && !value.value) {
    return 'transform -rotate-[12deg] translate-y-[2px] scale-[1.1] bg-[#999]'
  }
  return ''
})
</script>
