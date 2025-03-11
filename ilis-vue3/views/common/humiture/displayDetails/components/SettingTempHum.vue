<template>
  <a-modal
    v-model:open="open"
    title="设置温湿度"
    width="460px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      class="pt-4 max-h-[70vh] overflow-auto"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="温度（℃）" name="WD">
        <a-input-number class="w-full" />
      </a-form-item>
      <a-form-item label="湿度（%RH）" name="SD">
        <a-input-number class="w-full" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref({
  WD: '',
  SD: '',
})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    formState.value.WD = props.dataSource.WD
    formState.value.SD = props.dataSource.SD
  }
})
function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true
    // await saveStandardApi(formState.value).finally(() => {
    //   submitLoading.value = false
    // })
    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
}
</script>
