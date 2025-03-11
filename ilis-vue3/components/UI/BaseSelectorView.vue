<template>
  <div v-lazyResize:height="300" class="w-[240px] min-h-[400px] flex flex-col">
    <BaseTitle>
      <span>
        <slot name="title">已选中设备（{{ data?.length }}台）</slot>
      </span>
      <template #right>
        <a-button
          danger
          size="small"
          @click="emits('removeAll')"
        >
          清空
        </a-button>
      </template>
    </BaseTitle>
    <a-card class="flex-1 overflow-auto">
      <div v-if="data?.length">
        <a-tag
          v-for="i in data"
          :key="i.value"
          class="mb-1"
          closable
          @close="emits('removeItem', i)"
        >
          {{ i.label }}
        </a-tag>
      </div>
      <a-empty v-else :description="emptyText"></a-empty>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import type { IOption } from '~/interface/IOption'

withDefaults(defineProps<{
  data: IOption[]
  emptyText?: string
}>(), {
  emptyText: '未选择设备',
})

const emits = defineEmits<{
  (e: 'removeItem', row: any): void
  (e: 'removeAll'): void
}>()
</script>
