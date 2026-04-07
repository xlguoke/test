<template>
  <div class=" flex items-center mb-3 font-bold" :class="`text-[${size === 'small' ? 14 : 16}px]`">
    <span class=" block w-1 mr-2 bg-colorPrimary rounded-e-sm" :class="`h-${size === 'small' ? 3 : 4}`"></span>
    <slot>标题</slot>
    <span class="flex-1 text-right ">
      <slot name="right" />
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'small' | 'normal'
}>(), {
  size: 'normal',
})
</script>
