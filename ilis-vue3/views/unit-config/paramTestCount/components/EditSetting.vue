<template>
  <a-modal
    v-model:open="open"
    title="设置共用试验数量"
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
      class="pt-4"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="共用试验数量名称" name="shareTestQuantityIdent" :rules="[{ required: true, message: '请输入共用试验数量名称！' }]">
        <a-input v-model:value="formState.shareTestQuantityIdent" placeholder="请输入" />
      </a-form-item>
      <a-form-item :label="unitMeasure ? `共用试验数量（${unitMeasure}）` : '共用试验数量'" name="shareTestQuantity" :rules="[{ required: true, message: '请输入共用试验数量！' }]">
        <a-input-number
          v-model:value="formState.shareTestQuantity"
          class="w-full"
          :min="0"
          placeholder="请输入"
        />
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
import type { PropType } from 'vue'
import { setShareTestQuantity } from '~/views/unit-config/paramTestCount/api.ts'
import { SetShareTestQuantityEntity } from '~/views/unit-config/paramTestCount/interface/TestQuantity.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  paramIds: {
    type: Array as PropType<string[]>,
    default: () => ([]),
  },
  unitMeasure: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref(new SetShareTestQuantityEntity())

const unitMeasure = computed(() => props.unitMeasure)

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    const data = new SetShareTestQuantityEntity()
    data.paramIds = props.paramIds || []
    formState.value = data
  }
})

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true
    await setShareTestQuantity(formState.value).finally(() => {
      submitLoading.value = false
    })
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
