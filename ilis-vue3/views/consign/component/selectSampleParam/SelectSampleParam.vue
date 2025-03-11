<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '0' }"
    >
      <a-flex vertical class="h-full py-2">
        <div v-if="tipVisible" class="p-2 pt-0">
          <a-alert :message="tipContent" banner />
        </div>
        <HtDrag :min-width="282" class="flex-1">
          <HtDragItem :width="dragWidth">
            <SampleTree @select="selectSampleParam" @show-expand-error-tip="setTipVisible(true)" />
          </HtDragItem>
          <HtDragItem>
            <Params :sample-node="sample" :nodes="nodes" />
          </HtDragItem>
        </HtDrag>
      </a-flex>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import { provide } from 'vue'
import SampleTree from './components/SampleTree.vue'
import Params from './components/Params.vue'
import { HtDrag, HtDragItem } from '~/components/htDraggable'
import type { SelectSampleEntity } from '~/views/consign/component/selectSampleParam/components/SampleTree.vue'
import type {
  BigCategoryTreeNode,
  ViewSampleTreeNode,
} from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

const dragWidth = ref(390)
onMounted(() => {
  const w = document.body.clientWidth || document.documentElement.clientWidth
  if (w <= 1280) {
    dragWidth.value = 282
  }
})

// 样品信息页面的基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo

// 是否为简易模式
const isSimpleMode = ref(top.localStorage.getItem('isSimpleMode') === 'true')
provide('isSimpleMode', isSimpleMode)

// 选中的样品节点
const sample = ref<ViewSampleTreeNode>()

// 展开的所有节点
const nodes = ref<Array<BigCategoryTreeNode | ViewSampleTreeNode>>([])

const [tipVisible, setTipVisible] = useStateHooks(false)

const tipContent = computed(() => {
  if (useBasicInfo.data.level) {
    return `样品层级已更新，请重新选择样品层级，原所选样品为${useBasicInfo.data.level}`
  }
  else {
    return `样品层级已更新，请重新选择样品层级`
  }
})

function selectSampleParam(data: SelectSampleEntity) {
  sample.value = data.sample
  nodes.value = data.nodes
}
</script>

<style>
body, body > div{
  height: 100%;
  overflow: hidden;
}
.ant-spin-nested-loading,
.ant-spin-container{
  height: 100%;
}
</style>
