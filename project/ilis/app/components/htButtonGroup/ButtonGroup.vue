<template>
  <div v-if="slotComponents.length" ref="htButtonGroup" class="flex gap-2 flex-wrap">
    <template v-for="(vnode, index) in slotComponents" :key="index">
      <component :is="(showMore || index < showCount) ? vnode : undefined" />
    </template>
    <a-button v-if="showMoreBtn" type="link" @click="showMore = !showMore">
      {{ showMore ? '收起' : '展开' }}
      <DoubleLeftOutlined v-if="showMore" />
      <DoubleRightOutlined v-else />
    </a-button>
  </div>
</template>

<script setup lang='ts'>
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue'
import { useResizeObserver } from '@vueuse/core'
import { Comment } from 'vue'
import { usePermissionStore } from '~/store/permissionStore'

withDefaults(defineProps<{
  showCount?: number
}>(), {
  showCount: 5,
})

const { hasPermission } = usePermissionStore()

const slots = useSlots()
const showMore = ref(true)
const showMoreBtn = ref(false)

const slotComponents = computed(() => {
  // 过滤掉注释：注释也是虚拟dom，根据类型过滤掉
  const list = slots.default
    ? slots.default().filter(d => d.type !== Comment)
    : []

  // 过滤无执行权限的组件
  return list.filter((d: any) => {
    const v = d.dirs ? d.dirs[0]?.value : ''
    if (!v)
      return true
    return hasPermission(v)
  })
})

useResizeObserver(document.body, () => {
  initShowMoreBtn()
})

const btnMargin = 8
const htButtonGroup = ref<HTMLDivElement>()

function initShowMoreBtn() {
  nextTick(() => {
    const wrapWidth = htButtonGroup.value?.clientWidth || 0
    const btns = htButtonGroup.value?.querySelectorAll('.ant-btn') as any as HTMLElement[]
    let btnW = 0
    if (btns && btns.length) {
      btns.forEach((btn: HTMLElement) => {
        btnW += btn.clientWidth + btnMargin
      })
    }
    showMoreBtn.value = btnW > wrapWidth
  })
}
</script>

<style>

</style>
