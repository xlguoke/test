<template>
  <span ref="outerRef" class=" flex-1 w-full break-words whitespace-nowrap">
    <span v-show="isOver">
      <a-tooltip>
        <template #title>
          <slot></slot>
        </template>
        <div
          ref="innerRef"
          class=" overflow-hidden text-ellipsis break-words whitespace-nowrap"
        >
          <slot></slot>
        </div>
      </a-tooltip>
    </span>
    <span v-show="!isOver">
      <slot></slot>
    </span>
  </span>
</template>

<script lang="ts" setup>
const outerRef = ref()

const innerRef = ref()

const isOver = ref(true)

onMounted(() => {
  isOver.value = outerRef.value.offsetWidth < innerRef.value.scrollWidth
})
</script>
