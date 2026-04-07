<template>
  <ht-modal
    v-model:open="open"
    title="撤回"
    width="640px"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    @cancel="cancel"
  >
    <div class="pt-2">
      您正在撤回{{ record.name }}（{{ record.typeText }}）的废物处置申请！
    </div>
    <a-form ref="formRef" :model="formState" class="pt-4">
      <a-form-item label="撤回原因" name="name">
        <a-textarea v-model:value.trim="formState.recallDesc" :rows="4" placeholder="请输入" />
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
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { ChemicalWasteHandleDTO } from '~/views/chemical/waste/handle/api.ts'
import { message } from 'ant-design-vue'
import { chemicalWasteHandleRecall } from '~/views/chemical/waste/handle/api.ts'

const props = defineProps<IDialogPropsParam<null, {
  record: ChemicalWasteHandleDTO
}>>()

const formRef = ref()

const record = computed(() => props.param.record)

const open = ref(true)

const formState = ref({
  recallDesc: '',
})

const submitLoading = ref(false)

// 关闭弹窗
function cancel() {
  open.value = false
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true

    await chemicalWasteHandleRecall(record.value.id, formState.value).finally(() => {
      submitLoading.value = false
    })

    message.success('操作成功')
    props.onConfirm(null)
    cancel()
  })
}
</script>
