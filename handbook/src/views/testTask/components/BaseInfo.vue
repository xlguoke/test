<script setup lang="ts">
import { inject, ref } from 'vue'
import { Form } from 'ant-design-vue'
import {
  BaseInfoProject,
  BaseInfoSample,
  BaseInfoTemplate,
  BaseInfoUnitProject,
} from './index'
import type { TaskBaseInfoDTO } from '@/type/testTask'

const formData = ref(inject('formData') as TaskBaseInfoDTO)

// 表单校验
const baseInfoForm = ref()
async function validBaseInfoForm() {
  try {
    return await baseInfoForm.value.validateFields()
  }
  catch (err) {
    return false
  }
}

function validFormData(fieldName: string) {
  baseInfoForm.value.validateFields([fieldName])
}

defineExpose({ validBaseInfoForm })
</script>

<template>
  <div class="baseinfo-form">
    <Form
      ref="baseInfoForm"
      class="custom-form"
      :model="formData"
      size="middle"
      layout="vertical"
    >
      <BaseInfoTemplate @valid="validFormData" />

      <BaseInfoProject @valid="validFormData" />

      <BaseInfoSample @valid="validFormData" />

      <BaseInfoUnitProject />
    </Form>
  </div>
</template>

<style lang="less" scoped>
.base-info-item {
  padding: 0.5rem 0;
  line-height: 18px;
}
</style>
