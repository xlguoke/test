<template>
  <ht-modal
    v-model:open="visible"
    title="选择规格型号"
    width="800px"
    :confirm-loading="loading"
    :hide-confirm="view === VIEW_TYPE.DETAIL"
    @cancel="cancelModal"
    @ok="submit"
  >
    <Index
      ref="specificationRef"
      :key="conKey"
      :sample-id="sampleId"
      :p-specifications="specifications"
      :view-type="view"
      :show-add-property="showAddProperty"
      @add-property="emits('addProperty')"
      @after-render="onAfterRender"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import Index from './components/Index.vue'
import { type Specifications, type SpecificationsInfo, VIEW_TYPE, type _VIEW_TYPE_ } from './api'

const props = defineProps<{
  open: boolean
  /** 样品id */
  sampleId: string
  /** 保存到元数据的规格型号 */
  specifications: Specifications[]
  /** 显示类型 */
  view?: _VIEW_TYPE_
  /** 是否显示添加属性功能 */
  showAddProperty?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:open', val: boolean): void
  /** 点击确定按钮回调 */
  (e: 'ok', data: SpecificationsInfo): void
  /** 弹窗内容加载完成后的回调 */
  (e: 'afterRender', data: SpecificationsInfo): void
  /** 关闭弹窗回调 */
  (e: 'cancel'): void
  /** 添加属性成功的回调 */
  (e: 'addProperty'): void
}>()

const visible = ref(props.open)
const loading = ref(false)
const conKey = ref(0)
const specificationRef = ref()

watch(() => props.open, (val) => {
  loading.value = false
  visible.value = val
  if (val)
    conKey.value++
})

function cancelModal() {
  visible.value = false
  emits('update:open', false)
}

function submit() {
  loading.value = true
  const datas: SpecificationsInfo = specificationRef.value.saveData()
  emits('ok', datas)
  cancelModal()
}

/**
 * ## 弹窗渲染完成后的回调
 */
function onAfterRender() {
  const datas: SpecificationsInfo = specificationRef.value.saveData(false)
  emits('afterRender', datas)
}

defineExpose({
  previewSpecification: (d: Specifications[]) => specificationRef.value.previewSpecification(d),
})
</script>

<style>

</style>
