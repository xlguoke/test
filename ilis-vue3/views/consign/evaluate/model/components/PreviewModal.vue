<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    title="问卷预览"
    destroy-on-close
    width="540px"
    :keyboard="false"
    :mask-closable="false"
    :body-style="{ height: '70vh', overflowY: 'auto', padding: '12px' }"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <div class=" font-bold text-xl text-center break-words">
      {{ detail?.name }}
    </div>
    <PreviewQuestionItem
      v-for="item in detail.problemList"
      :key="item.id"
      :data="item"
      class=" p-3 hover:bg-[#e5f3ff]"
    ></PreviewQuestionItem>
  </a-modal>
</template>

<script lang="ts" setup>
import { getEvaluateModelDetail } from '../api'
import { EvaluateModelEntity } from '../EvaluateModelEntity'
import PreviewQuestionItem from './PreviewQuestionItem.vue'

const props = withDefaults(defineProps<{
  show: boolean
  data: EvaluateModelEntity
}>(), { show: false })

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (val) {
    getDetail(props.data)
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

const detail = ref(new EvaluateModelEntity())

async function getDetail(row: EvaluateModelEntity) {
  const { data } = await getEvaluateModelDetail(row)
  detail.value = EvaluateModelEntity.fromJSON(data)
}
</script>
