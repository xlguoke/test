<template>
  <a-modal
    v-model:open="open"
    title="新增附加费用"
    width="460px"
    :mask-closable="false"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      class="mt-8"
      :model="formData"
      :rules="rules"
      :label-col="{ flex: '120px' }"
      :wrapper-col="{ flex: 'auto' }"
    >
      <a-form-item label="附加费用名称" name="name" required>
        <a-input v-model:value="formData.name" placeholder="请输入附加费用名称" />
      </a-form-item>
      <a-form-item label="价格" name="price" required>
        <a-input-number
          v-model:value="formData.price"
          style="width: 100%;"
          :min="0"
          placeholder="请输入价格"
        >
          <template #addonAfter>
            元
          </template>
        </a-input-number>
      </a-form-item>
      <a-form-item label="单位" name="priceUnit" required>
        <a-input v-model:value="formData.priceUnit" placeholder="请输入单位" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="formData.remark" :rows="4" placeholder="请输入备注" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { AddAdditionalFeeEntity } from '../modules/UseAdditionalFee'
import { additionalFeesAdd } from '../api'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const formRef = ref()
const formData = ref(new AddAdditionalFeeEntity())
const submitLoading = ref(false)

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入附加费用名称', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'change' }],
  priceUnit: [{ required: true, message: '请输入单位', trigger: 'change' }],
}

const open = computed(() => props.open)

watch(open, (val) => {
  if (!val) {
    formData.value = new AddAdditionalFeeEntity()
  }

  emits('update:open', val)
})

// 取消
const handleCancel = function () {
  emits('update:open', false)
}

// 提交
const handleOk = async function () {
  formRef.value.validate().then(async () => {
    submitLoading.value = true
    await additionalFeesAdd(formData.value).finally(() => {
      submitLoading.value = false
    })
    message.success('保存成功！')
    emits('onSave')
    handleCancel()
  })
}
</script>
