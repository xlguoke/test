<!-- 带输入提示弹窗，通过AnyDialogHelper.showPrompt 方法调用 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="360px"
    :title="title || '提示'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <a-form ref="formRef" :model="form" :rules="rules">
      <a-form-item name="content">
        <a-textarea v-model:value="form.content" :rows="4" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import type { IPromptProps } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IPromptProps>()

const internalOpen = ref(true)

const formRef = ref<FormInstance>()

const form = ref({
  content: '',
})

const rules = reactive({
  content: [{ required: props.required, message: '请输入' }],
})

/**
 * # 确认
 */
function handleConfirm() {
  formRef.value?.validate().then(() => {
    props.onConfirm(form.value.content)
    internalOpen.value = false
  })
}

onMounted(() => {
  form.value.content = props.initData || ''
})
</script>
