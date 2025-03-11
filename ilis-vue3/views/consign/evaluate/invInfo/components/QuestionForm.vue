<template>
  <van-form v-show="questions?.length" @submit="onSubmit">
    <div v-for="(data, i) in questions" :key="data.id" class="question-item">
      <div class="question-title">
        {{ `${i + 1}、${data.title}` }}
      </div>
      <!-- 文本问题 -->
      <van-field
        v-if="data.type === QuestionType.TEXT"
        v-model="data.result"
        :name="`${i}`"
        rows="3"
        autosize
        type="textarea"
        :placeholder="data.tips"
        style="border: 1px solid #ccc; border-radius: 4px;"
      />
      <van-field v-else :name="`${i}`">
        <template #input>
          <!-- 单选问题 -->
          <van-radio-group v-if="data.type === QuestionType.RADIO" v-model="data.result" style="width: 100%;">
            <van-radio
              v-for="(item, index) in data.items"
              :key="index"
              :name="item.id"
              style="margin-bottom: 8px;width: 100%"
            >
              <span>{{ item.name }}</span>
            </van-radio>
          </van-radio-group>
          <!-- 多选问题 -->
          <van-checkbox-group v-else-if="data.type === QuestionType.SELECT" v-model="data.result" style="width: 100%;">
            <van-checkbox
              v-for="(item, index) in data.items"
              :key="index"
              :name="item.id"
              shape="square"
              style="margin-bottom: 8px;width: 100%"
            >
              <span>{{ item.name }}</span>
            </van-checkbox>
          </van-checkbox-group>
        </template>
      </van-field>
    </div>
    <div style="margin: 16px 0;">
      <van-button
        round
        block
        type="primary"
        native-type="submit"
      >
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script lang="ts" setup>
import { type EvaluateQuestionEntity, QuestionType } from '../../model/EvaluateQuestionEntity'

defineProps<{
  questions: EvaluateQuestionEntity[]
}>()

const emits = defineEmits(['submit'])

function onSubmit(values: any) {
  emits('submit', values)
}
</script>

<style lang="less" scoped>
.question-item{
  padding: 12px 0;
  .question-title {
    margin-bottom: 12px;
    word-break: break-all;
  }
}
.text-red-500{
  color: red;
}
</style>
