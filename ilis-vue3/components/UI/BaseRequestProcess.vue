<template>
  <ht-modal
    v-model:open="show"
    centered
    width="500px"
    :title="title"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <div class=" hidden">
        keep
      </div>
    </template>
    <p>{{ message }}</p>
    <div class="h-[50px] flex flex-col items-center justify-center">
      <img :src="LoadingImage" alt="">
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import { getProgressMsg } from '~/api/common'

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

const message = ref('')

const timer = ref()

watchEffect(async () => {
  if (props.modelValue) {
    timer.value = setInterval(() => {
      getProgressMsgData()
    }, 300)
  }
  else {
    clearInterval(timer.value)
  }
})

async function getProgressMsgData() {
  const { data } = await getProgressMsg({
    businessKey: props.businessKey,
    type: props.type,
  })
  message.value = data
}
</script>
