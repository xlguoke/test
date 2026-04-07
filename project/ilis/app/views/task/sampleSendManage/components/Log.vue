<template>
  <HtModal
    v-model:open="showDialog"
    title="进度跟踪"
    :after-close="onClosed"
    @ok="handleConfirm()"
  >
    <div class="pr-3">
      <a-timeline>
        <a-timeline-item v-for="(item, index) in data" :key="index">
          <a-card :title="item.value" :bordered="false" hoverable>
            <div>{{ item.label }}</div>
          </a-card>
        </a-timeline-item>
      </a-timeline>
    </div>
  </HtModal>
</template>

<script setup lang='ts'>
import type { SampleSendEntity } from '../SampleSendEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'

/** 带参数的弹窗props */
defineProps<IDialogPropsParam<SampleSendEntity[], any>>()

const showDialog = ref(true)

const data = ref<IOption[]>([
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
  {
    label: '文本测试测试测试测试测试测试测试测试测试测试测试测试',
    value: '2025-09-01 12:00:00',
  },
])

async function handleConfirm() {

}
</script>

<style>

</style>
