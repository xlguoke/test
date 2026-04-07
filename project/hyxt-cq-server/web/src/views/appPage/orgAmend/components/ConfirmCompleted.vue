<template>
  <a-modal
    v-model:visible="visible"
    title="办结"
    :mask-closable="false"
    :keyboard="false"
    cancel-text="关闭"
    width="560px"
    :confirm-loading="saveLoading"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="form"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      :rules="rules"
      style="min-height: 30vh"
    >
      <a-form-item label="办结意见" name="opinion">
        <a-textarea
          v-model:value="form.opinion"
          :auto-size="{ minRows: 4, maxRows: 8 }"
          :maxlength="200"
          placeholder="请输入办结意见"
        />
      </a-form-item>
      <a-form-item label="附件资料">
        <UploadFile
          v-model:value="form.attachments"
          :config="{
            types: ['pdf', 'image', 'word', 'excel'],
            btnName: '上传附件'
          }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import UploadFile from "@/components/uploadFile/index.vue"
import { auditExecution } from "@/api/orgAmend.api"
import type { AuditParam } from "@/type/api/orgAmend.api"
import { message } from "ant-design-vue"

const emits = defineEmits(["confirm"])

const visible = ref(false)
const formRef = ref()
const form = ref<AuditParam>({
  orgAmendId: "",
  opinion: "",
  attachments: []
})
const rules = {
  opinion: [{ required: true, message: "请输入办结意见", trigger: "blur" }]
}

function openModal(id: string) {
  form.value = {
    orgAmendId: id,
    opinion: "",
    attachments: []
  }
  visible.value = true
}
defineExpose({
  openModal
})

const saveLoading = ref(false)
async function handleOk() {
  await formRef.value.validateFields()
  saveLoading.value = true
  try {
    await auditExecution(form.value)
    visible.value = false
    emits("confirm")
    message.success("操作成功")
  } finally {
    saveLoading.value = false
  }
}
</script>

<style scoped lang="less"></style>
