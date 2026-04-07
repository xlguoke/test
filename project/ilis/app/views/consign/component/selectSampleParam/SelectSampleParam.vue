<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '0 8px' }"
    >
      <a-flex vertical class="h-full py-2">
        <div v-if="tipVisible" class="p-2 pt-0">
          <a-alert :message="tipContent" banner />
        </div>
        <HtDrag :min-width="280" class="flex-1">
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
import type { MainController } from '../selectSample/modules/MainController'
import type { SelectSampleEntity } from '~/views/consign/component/selectSampleParam/components/SampleTree.vue'
import type {
  BigCategoryTreeNode,
  ViewSampleTreeNode,
} from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import { HtDrag, HtDragItem } from '~/components/htDraggable'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { useIndustryStore } from '~/store/industryStore'
import { selectSampleParamStore } from '~/views/consign/component/selectSampleParam/hooks/useSelectSampleParamStore.ts'
import Params from './components/Params.vue'
import SampleTree from './components/SampleTree.vue'

const dragWidth = ref(390)

const { width } = useWindowSize()

onMounted(() => {
  if (width.value <= 1440) {
    dragWidth.value = 282
  }
})

// 样品信息页面的基础信息
const mainController = inject('mainController') as MainController
const { term } = useIndustryStore()

// 是否为简易模式
selectSampleParamStore.isSimpleMode = localStorage.getItem('isSimpleMode') === 'true'

// 选中的样品节点
const sample = ref<ViewSampleTreeNode>()

// 展开的所有节点
const nodes = ref<Array<BigCategoryTreeNode | ViewSampleTreeNode>>([])

const [tipVisible, setTipVisible] = useStateHooks(false)

const tipContent = computed(() => {
  if (mainController.useBasicInfo.data.level) {
    return `${term('样品')}层级已更新，请重新选择${term('样品')}层级，原所选${term('样品')}为${mainController.useBasicInfo.data.level}`
  }
  else {
    return `样${term('样品')}层级已更新，请重新选择`
  }
})

function selectSampleParam(data: SelectSampleEntity) {
  sample.value = data.sample
  nodes.value = data.nodes
}
</script>
