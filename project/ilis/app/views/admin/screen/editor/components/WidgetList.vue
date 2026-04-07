<template>
  <a-collapse v-model:active-key="active">
    <a-collapse-panel
      v-for="item in WidgetCategoryDict"
      :key="item.key.toString()"
      :header="item.label"
    >
      <section :ref="($el) => setRef($el as HTMLElement, item.key as WidgetCategory)" class="flex flex-col gap-3">
        <template
          v-for="(widget, index) in renderMap[item.key as WidgetCategory]"
          :key="index"
        >
          <component
            :is="widget.thumbnailComponent"
            v-if="widget.thumbnailComponent"
          ></component>
          <div v-else class="p-3 shadow-md rounded-md">
            <CodeOutlined />
            {{ widget.name }}
          </div>
        </template>
      </section>
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts" setup>
import type { IWidget } from '~/interface/IWidget'
import { CodeOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useDraggable } from 'vue-draggable-plus'
import { useScreenEditorStore } from '~/store/screenEditorStore'
import { customComponentsApi } from '../api'
import { WidgetCategory, WidgetCategoryDict } from '../widgets'
import { register } from '../widgets/register'

const { renderWidgets } = toRefs(useScreenEditorStore())

const list = ref(register)

const renderMap = computed(() => {
  return list.value.reduce((acc, cur) => {
    const category = cur.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(cur)
    return acc
  }, {} as Record<IWidget['category'], IWidget[]>)
})

const active = ref(Object.keys(renderMap.value))

const dynamicWidgetListRef = shallowRef({} as Record<IWidget['category'], HTMLElement>)

const draggableInstances = new Map<string, ReturnType<typeof useDraggable>>()

function setRef(el: HTMLElement, category: IWidget['category']) {
  if (!el || draggableInstances.has(category))
    return

  const instance = useDraggable(el, toRef(renderMap.value[category]), {
    animation: 150,
    group: {
      name: 'widgets', // 建议使用更有意义的名称
      pull: 'clone',
      put: false,
    },
    sort: false,
    clone: (e: IWidget) => {
      if (renderWidgets.value?.some(item => item.name === e.name)) {
        message.warning('该组件已使用')
        return undefined as unknown as IWidget // 防止类型报错
      }
      return e
    },
  })

  draggableInstances.set(category, instance)
  dynamicWidgetListRef.value[category] = el
}

/** 自定义组件 */
const spinning = ref(false)
async function getCustomComponents() {
  try {
    spinning.value = true
    const { data } = await customComponentsApi()
    const customs = data.map(item => ({
      name: item.name,
      key: item.name as any,
      category: WidgetCategory.CUSTOM,
      component: defineAsyncComponent(() => import('../widgets/custom/Render.vue')),
    }))
    list.value = list.value.concat(customs)
    spinning.value = false
  }
  catch (err) {
    spinning.value = false
    console.error(err)
  }
}

onMounted(() => {
  getCustomComponents()
})

onUnmounted(() => {
  draggableInstances.forEach((instance) => {
    instance.destroy()
  })
})
</script>
