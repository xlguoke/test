<template>
  <AppProvider>
    <a-button type="primary" @click="openSpecificationModal">
      选择
    </a-button>

    <!-- 设置规格型号 -->
    <SpecificationModal
      v-model:open="specificationVisible"
      :sample-id="cataLog.sampleId"
      :specifications="cataLog.specifications"
      :view="cataLog.view"
      :force-render="cataLog.view === VIEW_TYPE.ADD"
      @after-render="onAfterRenderSpecification"
      @ok="onSaveSpecification"
    />
  </AppProvider>
</template>

<script setup lang='ts'>
import type { _VIEW_TYPE_, Specifications, SpecificationsInfo } from './api'
import { VIEW_TYPE } from './api'
import { mergeMetaSpecifications } from './modules/mergeSpecifications'
import SpecificationModal from './SpecificationModal.vue'

interface Catalog {
  sampleId: string
  specifications: Specifications[]
  otherInfos?: Specifications[]
  view?: _VIEW_TYPE_
  disabled?: boolean
  isInit?: boolean
}

const specificationVisible = ref(false)
const cataLog = ref<Catalog>({
  sampleId: '',
  specifications: [],
  view: VIEW_TYPE.ADD,
})

// 选择样品后初始化默认规格型号
function initSpecifications(data: Catalog) {
  cataLog.value = data
}

// 编辑规格型号
function openSpecificationModal() {
  const data = window.vm_selectSpecification()
  if (!data)
    return

  // 合并规格型号
  if (data.view === VIEW_TYPE.EDIT) {
    data.specifications = mergeMetaSpecifications(data.otherInfos, data.specifications)
  }

  cataLog.value = data
  specificationVisible.value = true
}

function onAfterRenderSpecification(data: SpecificationsInfo) {
  if (cataLog.value.view !== VIEW_TYPE.ADD)
    return
  window.vm_specificationsCallback(data, cataLog.value.isInit)
}

function onSaveSpecification(data: SpecificationsInfo) {
  if (cataLog.value.view !== VIEW_TYPE.DETAIL) {
    window.vm_specificationsCallback(data, cataLog.value.isInit)
  }
  specificationVisible.value = false
}

if (!window.vm) {
  window.vm = {}
}
window.vm.initSpecifications = initSpecifications
window.vm.openSpecificationModal = openSpecificationModal
</script>

<style>
#select_specification{
  height: 100%;
}
</style>
