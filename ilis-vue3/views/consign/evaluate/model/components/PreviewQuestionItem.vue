<template>
  <div class=" py-3">
    <div class=" flex gap-3 mb-3">
      <span class=" flex-1 break-words text">{{ data.title }}</span>
      <span><slot name="title-right"></slot></span>
    </div>
    <!-- 单选问题 -->
    <a-radio-group v-if="data.type === QuestionType.RADIO" v-model:value="innerData.result">
      <div v-for="(item, index) in data.items" :key="index">
        <a-radio :value="item.name">
          <span :class="item.caution === 'YES' ? 'text-red-500' : ''">{{ item.name }}</span>
        </a-radio>
      </div>
    </a-radio-group>
    <!-- 多选问题 -->
    <a-checkbox-group v-else-if="data.type === QuestionType.SELECT">
      <a-row>
        <a-col v-for="(item, index) in data.items" :key="index" :span="24">
          <a-checkbox :value="item.name">
            <span :class="item.caution === 'YES' ? 'text-red-500' : ''">{{ item.name }}</span>
          </a-checkbox>
        </a-col>
      </a-row>
    </a-checkbox-group>
    <!-- 文本问题 -->
    <a-input
      v-else-if="data.type === QuestionType.TEXT"
      :placeholder="data.tips"
    />
  </div>
</template>

<script lang="ts" setup>
import { type EvaluateQuestionEntity, QuestionType } from '../EvaluateQuestionEntity'

const props = defineProps<{
  data: EvaluateQuestionEntity
}>()

const innerData = ref<EvaluateQuestionEntity>(props.data)
</script>
