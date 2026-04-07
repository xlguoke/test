<template>
  <div
    v-if="visible"
    ref="el"
    class="pile-statistics-popup"
    :style="[
      {
        width: width,
        position: 'fixed',
        zIndex: 1000
      },
      dragStyle
    ]"
  >
    <div class="popup-header">
      <h2>{{ title }}</h2>
      <h2>{{ x }},{{ y }}</h2>
    </div>
    <!-- 中部插槽区域，可插入内容、按钮等 -->
    <div class="popup-slot">
      <slot name="function"></slot>
    </div>
    <div class="popup-table">
      <!-- <PileTable :table-data="tableData" /> -->
      <slot name="table"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue"
import { useDraggable } from "@vueuse/core"
const el = ref<HTMLElement | null>(null)

withDefaults(
  defineProps<{
    //   tableData?: TableData[] // 接收父组件传入的表格数据
    title: string
    width?: string
  }>(),
  {
    width: "600px"
  }
)

const {
  x,
  y,
  style: dragStyle
} = useDraggable(el, {
  initialValue: { x: 400, y: 400 }
})
const visible = ref(false)

function showModal() {
  visible.value = !visible.value
}

defineExpose({
  showModal
})
</script>

<style scoped>
.pile-statistics-popup {
  border: 1px solid;
  border-image: #40e7d5;
  background: rgba(64, 231, 213, 0.2);
  /* padding: 16px; 整体内间距，可根据需求调整 */
  margin: 16px 0; /* 与其他元素的外间距，可按需调整 */
  display: flex;
  flex-direction: column;
  /* gap: 4px; 不同部分之间的间隔 */
}

.popup-header {
  font-size: 15px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  /* padding-bottom: 12px; 为下边框留出空间 */
  border-bottom: 1px solid;
  border-image: rgba(64, 231, 213, 0.8);
}

.popup-slot {
  /* 插槽区域可根据插入内容需求调整样式，这里简单设置 */
  margin-top: 5px;
  padding: 0 10px;
  flex: 1;
}

.popup-table {
  /* 表格区域样式，可根据表格组件适配调整 */
  padding: 0 10px;
  margin-bottom: 10px;
  width: 100%;
}
</style>
