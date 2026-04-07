<template>
  <a-tooltip>
    <template #title>
      {{ data.explainText || data.text }}
    </template>
    <div
      class="inline-block text-white rounded-md cursor-pointer px-[5px] py-[2px] shadow-sm flex-shrink-0 whitespace-nowrap select-none"
      :style="{
        backgroundColor: data.markColor,
      }"
    >
      {{ data.text }}
    </div>
  </a-tooltip>
</template>

<script lang="ts" setup>
import type { ICustomMark } from '~/interface/ICustomMark'

defineProps<{
  data: ICustomMark
}>()
</script>
