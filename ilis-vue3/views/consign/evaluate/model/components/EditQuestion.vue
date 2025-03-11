<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    title="问题设置"
    destroy-on-close
    width="520px"
    :keyboard="false"
    :mask-closable="false"
    :body-style="{ height: '30vh', overflowY: 'auto' }"
    @ok="handleOk"
  >
    <IlisForm
      ref="ilisFormRef"
      :cols="1"
      :entity="EvaluateQuestionEntity"
      :init-data="initData"
      :field-list="['title', 'type']"
    >
      <template #form-after="{ data: formData }">
        <!-- 问题选项 -->
        <a-form-item
          v-if="[QuestionType.RADIO, QuestionType.SELECT].includes((formData as EvaluateQuestionEntity)?.type)"
          name="itemsStr"
          :label="EvaluateQuestionEntity.getFormFieldLabel('itemsStr')"
          :rules="AnyValidatorHelper.getValidateRules(EvaluateQuestionEntity)?.itemsStr"
        >
          <a-select
            v-model:value="formData.itemsStr"
            :allow-clear="true"
            :token-separators="[',']"
            :max-tag-text-length="6"
            mode="tags"
            placeholder="请输入属性候选值"
            @change="handleSelectChange(formData as EvaluateQuestionEntity)"
          >
            <a-select-option v-for="item in items" :key="item + 1" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- 警示选项 -->
        <a-form-item
          v-if="[QuestionType.RADIO, QuestionType.SELECT].includes((formData as EvaluateQuestionEntity)?.type)"
          name="cautionItems"
          :label="EvaluateQuestionEntity.getFormFieldLabel('cautionItems')"
          :rules="AnyValidatorHelper.getValidateRules(EvaluateQuestionEntity)?.tips"
        >
          <IlisInput
            v-model="formData.cautionItems"
            field="cautionItems"
            mode="multiple"
            :max-tag-text-length="6"
            :entity="EvaluateQuestionEntity"
            :options="formData?.itemsStr?.map((item:string) => ({ label: item, value: item }))"
            :placeholder="formData?.itemsStr?.length ? undefined : '请先添加选项' "
          ></IlisInput>
        </a-form-item>
        <!-- 提示 -->
        <a-form-item
          v-if="[QuestionType.TEXT].includes((formData as EvaluateQuestionEntity)?.type)"
          name="tips"
          :label="EvaluateQuestionEntity.getFormFieldLabel('tips')"
          :rules="AnyValidatorHelper.getValidateRules(EvaluateQuestionEntity)?.tips"
        >
          <IlisInput
            v-model="formData.tips"
            field="tips"
            :entity="EvaluateQuestionEntity"
          ></IlisInput>
        </a-form-item>
      </template>
    </IlisForm>
  </a-modal>
</template>

<script lang="ts" setup>
import { Modal } from 'ant-design-vue'
import { EvaluateQuestionEntity, IsCautionItem, QuestionType } from '../EvaluateQuestionEntity'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { IlisForm, IlisInput } from '~/components/ilisComponent'

const props = withDefaults(defineProps<{
  show: boolean
  /**
   * # 待编辑数据
   */
  data: EvaluateQuestionEntity
  /**
   * # 当前的问题列表（用于判断是否添加重复问题）
   */
  currentQustionList: EvaluateQuestionEntity[]
}>(), { show: false })

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: EvaluateQuestionEntity): void
  (e: 'close'): void
}>()

const internalOpen = ref(props.show)

const ilisFormRef = ref()

const initData = computed(() => {
  const data = props.data
  if (props.data.type !== QuestionType.TEXT) {
    data.itemsStr = data.items?.map((item: any) => item.name)
    data.cautionItems = data.items?.filter((item: any) => item.caution === IsCautionItem.YES).map((item: any) => item.name)
    return data
  }
  return data
})

/**
 * # 问题选项
 */
const items = ref([])

watch(() => props.show, (val) => {
  internalOpen.value = val
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

function handleSelectChange(form: EvaluateQuestionEntity) {
  const { itemsStr } = form
  const newCautionItems = [] as string[]
  form.cautionItems?.forEach((i: string) => {
    if (itemsStr?.includes(i)) {
      newCautionItems.push(i)
    }
  })
  form.cautionItems = newCautionItems
}

async function handleOk() {
  const ilisFormData = await ilisFormRef.value.getFormData() as EvaluateQuestionEntity
  ilisFormData.items = ilisFormData.itemsStr?.map((item: string) => {
    return {
      name: item,
      caution: ilisFormData.cautionItems?.includes(item) ? IsCautionItem.YES : IsCautionItem.NO,
    }
  })
  // 新添加的时候给这条数据设个临时id，确保再次编辑时能区分数据
  if (!ilisFormData.id) {
    // 检查问题是否重复
    const currentNameArr = props.currentQustionList.map(item => item.title)
    if (currentNameArr.includes(ilisFormData.title)) {
      Modal.warning({
        title: '当前问卷下已存在该问题！',
        content: '当前问卷已存在该问题，请勿添加相同问题！',
        centered: true,
      })
      return
    }
    ilisFormData.id = Date.now()
  }
  emits('confirm', ilisFormData)
}
</script>
