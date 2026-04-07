<template>
  <div class=" w-full h-full flex flex-col ">
    <div class=" w-full flex-1 h-0 flex justify-between gap-5 ">
      <!-- 组件预览列表 -->
      <div class="h-full overflow-y-auto">
        <WidgetList class="w-[300px] shadow-md rounded-md"></WidgetList>
      </div>
      <!-- 渲染区 -->
      <Graph class="flex-1 h-full"></Graph>
      <!-- 组件配置 -->
      <div class="w-[300px] flex flex-col gap-5 shadow-md rounded-md p-3 m-1">
        <!-- 表单 -->
        <WidgetForm class="flex-1 h-0 overflow-y-auto"></WidgetForm>
        <!-- 操作 -->
        <div class="flex gap-5 justify-end">
          <a-button @click="emits('cancel')">
            取消
          </a-button>
          <!-- <a-button type="primary" @click="emits('preview')">
            预览
          </a-button> -->
          <a-button type="primary" @click="emits('save')">
            保存
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Graph from './components/Graph.vue'
import WidgetForm from './components/WidgetForm.vue'
import WidgetList from './components/WidgetList.vue'

const emits = defineEmits<{
  (e: 'save'): void
  (e: 'preview'): void
  (e: 'cancel'): void
}>()
</script>

<style lang="less" scoped>
* {
  user-select: none;
}
</style>
