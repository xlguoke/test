<template>
  <div class="graph-container rounded-md" @click="currentWidget = null">
    <div class="flex justify-end gap-3 ">
      <div class=" absolute top-0 right-0 shadow-md bg-white rounded-md">
        <a-button :icon="h(UndoOutlined)" type="text" @click="undo">
        </a-button>
        <a-button :icon="h(RedoOutlined)" type="text" @click="redo">
        </a-button>
      </div>
    </div>
    <div
      ref="containerRef"
      class="p-3 m-auto w-[calc(360px)] h-[calc(640px)] preview-bg overflow-y-auto rounded-md"
      :class="[!currentWidget?.name ? tergetComponentClass : '']"
    >
      <Header></Header>
      <section ref="dropZoneRef" class="min-h-[calc(640px-140px)]">
        <template v-for="(widget) in renderWidgets" :key="widget.name">
          <component
            :is="widget.category === WidgetCategory.CUSTOM ? CustomRender : register?.find(i => i.name === widget.name)?.component"
            draggable
            class="mb-[10px] screen-card"
            :widget-name="widget.name"
            :class="[currentWidget?.name === widget.name ? tergetComponentClass : '']"
            @click.stop="currentWidget = widget"
            @dragstart="draggedWidget = widget"
          ></component>
        </template>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IWidget } from '~/interface/IWidget'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons-vue'
import { useDraggable } from 'vue-draggable-plus'
import { useScreenEditorStore } from '~/store/screenEditorStore'
import { useEditorTools } from '../hooks/useEditorTools'
import { WidgetCategory } from '../widgets'
import { register } from '../widgets/register'
import Header from './Header.vue'

const CustomRender = defineAsyncComponent(() => import('../widgets/custom/Render.vue'))

const { renderWidgets, currentWidget } = toRefs(useScreenEditorStore())

const { undo, redo, remove } = useEditorTools()

const containerRef = ref<HTMLElement>()

const dropZoneRef = ref<HTMLElement>() // 给.drop-zone添加ref="dropZoneRef"

const tergetComponentClass = 'border-2 border-dashed border-colorPrimary'

const draggedWidget = ref<IWidget>()

function handleDragEnd(e: any) {
  const dragEvent = e.originalEvent
  if (!dropZoneRef.value || !dragEvent) {
    return
  }
  const zoneRect = dropZoneRef.value.getBoundingClientRect()
  const isOutside
    = dragEvent.clientX < zoneRect.left
      || dragEvent.clientX > zoneRect.right
      || dragEvent.clientY < zoneRect.top
      || dragEvent.clientY > zoneRect.bottom

  if (isOutside && draggedWidget.value) {
    remove(draggedWidget.value)
  }
  draggedWidget.value = undefined
}

useDraggable(dropZoneRef, renderWidgets, {
  animation: 150,
  group: 'widgets',
  onEnd: handleDragEnd,
})
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  width: 4px;
  background-color: #fafafa;
}
::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 2px;
}

.graph-container{
  background-image: radial-gradient(transparent 1px, #fff 1px);
  background-size: 20px 20px;
  backdrop-filter: saturate(50%) blur(4px);
  background-color: #ccc;
}

.preview-bg{
  background: radial-gradient(circle at 20% 30%, #d9eff9, #beebea 40%, #c7efff);
}
</style>
