<script setup lang='ts'>
import { message } from 'ant-design-vue'
import UploadAvatar from '@/components/UploadAvatar.vue'
import useMyFetch from '@/composables/useMyFetch'
import type { DetailForm } from '@/types/applications.d'

const emits = defineEmits(['save'])

const spinning = ref(false)
const visible = ref(false)
const submitLoad = ref(false)
const detailFormRef = ref()
const detailForm = ref<DetailForm>({
  name: '',
  url: '',
  owners: [],
})

const urlReg = /https?:\/\/[-\w+&@#/%?=~|!:,.;]+[-\w+&@#/%=~|]/
function validUrl(_rule: any, value: string) {
  if (value && !urlReg.test(value))
    return Promise.reject(new Error('请输入正确的系统地址，如http://www.example.com'))
  return Promise.resolve()
}

const rules = {
  name: [
    { required: true, message: '请输入系统名称' },
  ],
  url: [
    { required: true, message: '请输入系统地址' },
    { validator: validUrl },
  ],
  logoUrl: [
    { validator: validUrl },
  ],
  loginUrl: [
    { validator: validUrl },
  ],
}

// 获取用户详情
async function getDetailData(id?: string) {
  if (!id)
    return
  spinning.value = true
  const { data, error } = await useMyFetch<DetailForm>(`/api/v1/applications/${id}`)
  spinning.value = false
  if (error.value || !data.value)
    return

  detailForm.value = { id, ...data.value }
}

// 关闭编辑弹窗
function cancelModal() {
  visible.value = false
  submitLoad.value = false
  detailFormRef.value?.resetFields()
  detailForm.value.id = ''
}

// 保存
async function submit() {
  try {
    await detailFormRef.value?.validateFields()
    submitLoad.value = true
    const form = { ...detailForm.value }

    const { error } = await useMyFetch<DetailForm[]>(`/api/v1/applications${form.id ? `/${form.id}` : ''}`, {
      method: form.id ? 'PUT' : 'POST',
      body: JSON.stringify(form),
    })
    submitLoad.value = false
    if (error.value)
      return
    message.success('保存成功')
    cancelModal()
    emits('save')
  }
  catch (err) {
    console.error('save-app->', err)
  }
  submitLoad.value = false
}

const modalTitle = ref('')
function openModal(title: string, id?: string) {
  modalTitle.value = title
  visible.value = true
  getDetailData(id)
}

defineExpose({
  openModal,
})
</script>

<template>
  <!-- 新增、编辑 -->
  <a-modal
    v-model:open="visible"
    :title="modalTitle"
    :keyboard="false"
    :mask-closable="false"
    :confirm-loading="submitLoad"
    centered
    width="600px"
    @cancel="cancelModal"
    @ok="submit"
  >
    <a-spin :spinning="spinning">
      <div class="my-4 max-h-[60vh] min-h-[200px] overflow-auto">
        <a-form
          ref="detailFormRef"
          :model="detailForm"
          :rules="rules"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-form-item label="logo" name="logo">
            <UploadAvatar v-model:value="detailForm.logo" />
          </a-form-item>
          <a-form-item label="logoUrl" name="logoUrl">
            <a-input v-model:value="detailForm.logoUrl" :maxlength="200" allow-clear placeholder="请输入logo网络地址" />
          </a-form-item>
          <a-form-item label="系统名称" name="name">
            <a-input v-model:value="detailForm.name" :maxlength="50" allow-clear placeholder="请输入系统名称" />
          </a-form-item>
          <a-form-item label="系统地址" name="url">
            <a-input v-model:value="detailForm.url" :maxlength="200" allow-clear placeholder="请输入系统地址" />
          </a-form-item>
          <a-form-item label="系统描述" name="description">
            <a-input v-model:value="detailForm.description" :maxlength="200" allow-clear placeholder="请输入系统描述" />
          </a-form-item>
          <a-form-item label="密钥" name="securityKey">
            <a-input v-model:value="detailForm.securityKey" :maxlength="200" allow-clear placeholder="请输入密钥" />
          </a-form-item>
          <a-form-item label="公钥" name="publicKey">
            <a-input v-model:value="detailForm.publicKey" :maxlength="200" allow-clear placeholder="请输入公钥" />
          </a-form-item>
          <a-form-item label="登录地址" name="loginUrl">
            <a-input v-model:value="detailForm.loginUrl" :maxlength="200" allow-clear placeholder="请输入登录地址" />
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
  </a-modal>
</template>
