<template>
  <HtModal
    v-model:open="showDialog"
    title="评价详情"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="showDialog = false">
        关闭
      </a-button>
    </template>
    <div class=" font-bold text-xl text-center break-words bg-[#f2f2f2] p-3 mb-3">
      {{ detail?.name }}
    </div>
    <div
      v-for="(item, index) in detail?.recordProblemList"
      :key="item.modelProblemId"
      class="mb-3"
    >
      <div>{{ `${index + 1}、${item.modelProblemName}` }}</div>
      <div>
        <span>答案：</span>
        <span
          :class="{
            'text-red-500': item.caution === IsCautionItem.YES,
          }"
        >{{ `${item.answer || ''}` }}</span>
      </div>
    </div>
    <div class=" font-bold text-xl text-center break-words bg-[#f2f2f2] p-3 mb-3">
      警示处理
    </div>
    <div class=" flex justify-between mb-3">
      <span>处理人：{{ detail?.handleUser }}</span>
      <span>处理时间：{{ AnyDateTimeHelper.format(detail?.handleDate || '', EDateFormatType.YYYY_MM_DD) }}</span>
    </div>
    <a-textarea :value="detail?.handleRemark" readonly :rows="3">
    </a-textarea>
  </HtModal>
</template>

<script setup lang='ts'>
import { IsCautionItem } from '../../model/EvaluateQuestionEntity'
import type { EvaluateRecordDetailEntity } from '../EvaluateRecordDetailEntity'
import type { EvaluateRecordEntity } from '../EvaluateRecordEntity'
import { getEvaluateRecordDetail } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EvaluateRecordEntity>>()

const showDialog = ref(true)

const detail = ref<EvaluateRecordDetailEntity>()

async function getData() {
  const { data } = await getEvaluateRecordDetail(props.param)
  detail.value = data
}

getData()
</script>
