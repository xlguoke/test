<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :keyboard="false"
    width="450px"
  >
    <a-form
      ref="formRef"
      :model="form"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      style="min-height: 100px"
    >
      <a-form-item
        :label="`${title}意见`"
        name="opinion"
        :rules="[{ required: true, message: `请输入${title}意见`, trigger: 'blur' }]"
      >
        <a-textarea
          v-model:value="form.opinion"
          :auto-size="{ minRows: 4, maxRows: 8 }"
          :maxlength="200"
          :placeholder="`请输入${title}意见`"
          allow-clear
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"

const visible = ref(false)
const title = ref("阅示")
const formRef = ref()
const form = ref({
  opinion: ""
})

function openModal() {
  form.value = {
    opinion: ""
  }
  visible.value = true
}
defineExpose({
  openModal
})

async function handleOk() {
  await formRef.value.validateFields()
}
</script>

<style scoped lang="less"></style>
