<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseInfoProject,
  BaseInfoSample,
  BaseInfoTemplate,
  BaseInfoUnitProject,
} from './index'

// 表单校验
const baseInfoForm = ref()
async function validBaseInfoForm() {
  try {
    return await baseInfoForm.value.validate()
  }
  catch (err) {
    return false
  }
}

function validFormData(fieldName: string) {
  baseInfoForm.value.validate([fieldName])
}

defineExpose({ validBaseInfoForm })
</script>

<template>
  <div class="baseinfo-form">
    <van-form
      ref="baseInfoForm"
      class="custom-form"
      label-align="top"
      required="auto"
    >
      <BaseInfoTemplate @valid="validFormData" />

      <BaseInfoProject @valid="validFormData" />

      <BaseInfoSample @valid="validFormData" />

      <BaseInfoUnitProject />
    </van-form>
  </div>
</template>

<style lang="less" scoped>
.base-info-item {
  padding: 0.5rem 0;
  line-height: 18px;
}
</style>
