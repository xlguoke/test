<template>
  <a-modal
    v-model:visible="visible"
    title="技术咨询"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="confirmLoading"
    width="900px"
    @ok="handleOk"
  >
    <a-form ref="refForm" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item
        label="咨询标题"
        name="title"
        :rules="[{ required: true, message: '请输入咨询标题' }]"
      >
        <a-input v-model:value="form.title" placeholder="请输入咨询标题" />
      </a-form-item>
      <a-form-item
        label="咨询内容"
        name="content"
        :rules="[{ required: true, message: '请输入咨询内容' }]"
      >
        <a-textarea
          v-model:value="form.content"
          placeholder="请输入咨询内容（最多可输入400个汉字，包括符号）"
          :max-length="400"
        />
        <p style="text-align: right; color: #999; font-size: 12px; float: right; height: 0">
          {{ form.content.length }} / 400
        </p>
      </a-form-item>
      <a-form-item
        label="联系方式"
        name="contactNo"
        :rules="[{ required: true, message: `请输入${contactText[form.contact]}` }]"
      >
        <a-input-group compact>
          <a-select
            v-model:value="form.contact"
            style="width: 120px"
            placeholder="请选择联系方式"
            @change="changeContact"
          >
            <a-select-option value="PHONE">联系电话</a-select-option>
            <a-select-option value="WE_CHAT">微信</a-select-option>
            <a-select-option value="QQ">QQ</a-select-option>
            <a-select-option value="EMAIL">邮箱</a-select-option>
          </a-select>
          <a-input
            v-model:value="form.contactNo"
            style="width: 50%"
            :placeholder="`请输入${contactText[form.contact]}`"
          />
        </a-input-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { FormInstance, message } from "ant-design-vue"
import { saveApi, dataItemType } from "@/api/technicalExchange.api"

const emit = defineEmits(["updateList"])

const visible = ref(false)
const openModal = () => {
  refForm.value?.resetFields()
  visible.value = true
}

defineExpose({
  openModal
})

const changeContact = () => {
  setTimeout(() => {
    ;(refForm.value as FormInstance).validateFields(["contactNo"])
  }, 0)
}

const contactText = {
  PHONE: "联系电话",
  WE_CHAT: "微信号",
  QQ: "qq号",
  EMAIL: "邮箱"
}
const form = ref<dataItemType>({
  id: "",
  title: "",
  content: "",
  contact: "PHONE",
  contactNo: ""
})

// 保存
const confirmLoading = ref<boolean>(false)
const refForm = ref<FormInstance>()
const handleOk = async () => {
  await (refForm.value as FormInstance).validateFields()
  const formObj = form.value
  confirmLoading.value = true
  if (!formObj.id) delete formObj.id
  saveApi(formObj)
    .then((res) => {
      message.success("保存成功")
      emit("updateList")
      visible.value = false
    })
    .catch(() => {
      confirmLoading.value = false
    })
}
</script>

<style scoped lang="less"></style>
