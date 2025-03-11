<template>
  <ht-modal
    v-model:open="visible"
    :title="`${formData.id ? '编辑' : '新增'}查新`"
    width="400px"
    :confirm-loading="loading"
    @ok="saveData"
    @cancel="cancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      class="mt-4"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item
        label="查新名称"
        name="name"
        :rules="[{ required: true, message: '请输入查新名称' }]"
      >
        <a-input
          v-model:value="formData.name"
          :maxlength="AppConfig.MAX_LENGTH_INPUT"
          placeholder="请输入查新名称"
        />
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { saveApi } from './api'
import type { StandardCheckNewEntity } from './listEntity'
import { AppConfig } from '~/anyThing/AppConfig'

const emits = defineEmits(['save'])

const visible = ref(false)
const loading = ref(false)
const formData = reactive({
  id: '',
  name: '',
})
const formRef = ref()

function cancel() {
  visible.value = false
  loading.value = false
  formData.id = ''
  formRef.value.resetFields()
}
async function saveData() {
  try {
    await formRef.value.validateFields()
    loading.value = true
    await saveApi(formData)
    message.success('保存成功!')
    cancel()
    emits('save')
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}

defineExpose({
  showModal: (row?: StandardCheckNewEntity) => {
    if (row) {
      formData.name = row.name || ''
      formData.id = `${row.id || ''}`
    }
    else {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      formData.name = `${year}年${month < 10 ? `0${month}` : month}月-规程查新`
    }
    visible.value = true
  },
})
</script>

<style>

</style>
