<!-- 水平布局容器（支持拖拽调整宽度与左侧面板折叠） -->
<template>
  <HtDrag>
    <HtDragItem :width="collapsed ? '0px' : props.leftWidth" class="relative">
      <slot name="left"></slot>
      <template v-if="collapseable" #after>
        <BaseToggleBar
          v-model="collapsed"
          class="absolute top-1/2 right-0 translate-x-[6px] -translate-y-1/2 z-10"
        ></BaseToggleBar>
      </template>
    </HtDragItem>
    <HtDragItem>
      <slot name="right">
      </slot>
    </HtDragItem>
  </HtDrag>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  collapsed?: boolean
  leftWidth?: string | number
  collapseable?: boolean
}>(), {
  collapsed: false,
  leftWidth: 260,
  collapseable: true,
})

const collapsed = ref(false)
</script>
