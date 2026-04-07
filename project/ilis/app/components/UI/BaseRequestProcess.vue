<template>
  <a-modal
    v-model:open="show"
    centered
    width="400px"
    :closable="false"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <div class=" hidden">
        keep
      </div>
    </template>
    <p class="mb-4">
      {{ sseData?.notice || '加载中，请稍后...' }}
    </p>
    <div
      v-if="sseData?.total && sseData?.total > 0"
      class="progress"
    >
      <div class="progress-bar" :style="{ width: `${progressVal}%` }">
        {{ progressVal }}%
      </div>
    </div>
    <div v-else class="h-[20px] w-full overflow-hidden rounded">
      <img :src="LoadingImage" class="w-[359px] max-w-[359px] h-[28px] ml-[-3px] mt-[-3px]" />
    </div>
  </a-modal>
</template>

<!-- 弃用，存在进度的功能采用 sseRequestProgress 组件，后端调整接口为sse服务 -->
<script lang="ts" setup>
import type { ProgressData } from '~/api/common'
import { SSE_TYPE, useConnectSSE } from '~/hooks/useSSE'

const props = withDefaults(defineProps<{
  modelValue: boolean
  type: string
  businessKey: string
  title?: string
}>(), {
  modelValue: false,
  title: '执行进度',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const LoadingImage = new URL('~/assets/img/loading-bar.gif', import.meta.url).href

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const businessKey = computed(() => props.businessKey)
const { sseData, initSSE, closeSSE } = useConnectSSE<ProgressData>({
  type: SSE_TYPE.PROGRESS,
  businessType: props.type,
  businessKey,
  onerror() {
    closeSSE()
    show.value = false
    emit('update:modelValue', false)
  },
})

const progressVal = computed(() => {
  const current = sseData.value?.current || 0
  const total = sseData.value?.total || 0
  if (total === 0)
    return 0
  return Math.floor(current / total * 100)
})

watch(() => props.modelValue, (val) => {
  if (val) {
    initSSE()
  }
  else {
    closeSSE()
  }
})
</script>

<style scoped>
.progress{
  border-radius: 4px;
  background-color: rgb(71 151 255 / 10%);
  box-shadow: 0 0 7px 0 rgb(35 137 209 / 58%) inset;
  overflow: hidden;
  box-sizing: border-box;
}
.progress-bar {
  display: inline-block;
  height: 20px;
  width: 0;
  line-height: 20px;
  border-radius: 4px;
  background: linear-gradient(#367cd9, #447ce7, #367cd9);
  color: #fff;
  text-align: right;
  transition: .2s;
  white-space: nowrap;
}
</style>
