<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import useMyFetch from '@/composables/useMyFetch'
import UploadAvatar from '@/components/UploadAvatar.vue'
import type { Certificates, DetailForm } from '@/types/users.d'
import type { DataSource as RoleData } from '@/types/roles.d'
import type { PageRes } from '@/types/pagination.d'

const emits = defineEmits(['save'])

const spinning = ref(false)
const visible = ref(false)
const submitLoad = ref(false)
const detailFormRef = ref()
const detailForm = ref<DetailForm>({
  username: '',
  name: '',
  phone: '',
  roles: [],
  roleIds: [],
  certificates: [
    { name: '', number: '' },
  ],
})

// 验证手机号
function validPhone(_rules: Rule, value: string) {
  if (value && !(/^1\d{10}$/.test(value))) {
    return Promise.reject(new Error('请输入正确的手机号'))
  }
  return Promise.resolve()
}
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
  ],
  name: [
    { required: true, message: '请输入用户名称' },
  ],
  roleIds: [
    { required: true, message: '请选择角色' },
  ],
  phone: [
    { validator: validPhone },
  ],
}

// 获取用户详情
async function getDetailData(id?: string) {
  if (!id)
    return
  spinning.value = true
  const { data, error } = await useMyFetch<DetailForm>(`/api/v1/users/${id}`)
  spinning.value = false
  if (error.value || !data.value)
    return
  if (!data.value.certificates.length) {
    data.value.certificates = [
      { name: '', number: '' },
    ]
  }
  if (data.value.roles && data.value.roles.length) {
    data.value.roleIds = data.value.roles.map(d => d.id)
  }
  detailForm.value = { id, ...data.value }
}

// 获取角色列表
const { execute: getRoleDatas, data: rolesData } = useMyFetch<PageRes<RoleData>>('/api/v1/roles', {
  params: { page: 0, pageSize: 999 },
}, {
  immediate: false,
})
const rolesOptions = computed(() => {
  if (!rolesData.value)
    return []
  const list: RoleData[] = rolesData.value?.content || []
  return list.map(item => ({
    ...item,
    label: item.name,
    value: item.id,
  }))
})

// 关闭编辑弹窗
function cancelModal() {
  visible.value = false
  submitLoad.value = false
  detailFormRef.value?.resetFields()
  detailForm.value.id = ''
  detailForm.value.certificates = [{ name: '', number: '' }]
}

// 保存
async function submit() {
  try {
    await detailFormRef.value?.validateFields()
    submitLoad.value = true
    const form = { ...detailForm.value }

    if (form.roleIds && form.roleIds.length) {
      form.roles = rolesOptions.value
        .filter(d => form.roleIds.includes(d.id))
        .map(d => ({ id: d.id, name: d.name }))
    }

    form.certificates = detailForm.value.certificates.filter(d => !!d.name)

    const { error } = await useMyFetch<DetailForm[]>(`/api/v1/users${form.id ? `/${form.id}` : ''}`, {
      method: form.id ? 'PUT' : 'POST',
      body: JSON.stringify(form),
    })
    submitLoad.value = false
    if (error.value)
      return
    message.success('保存成功')
    cancelModal()
    emits('save', { ...form })
  }
  catch (err) {
    console.error('save-user->', err)
  }
  submitLoad.value = false
}

// 删除资质
function removeCertificate(item: Certificates) {
  const index = detailForm.value.certificates.indexOf(item)
  if (index !== -1) {
    detailForm.value.certificates.splice(index, 1)
  }
}
// 新增资质
function addCertificate() {
  detailForm.value.certificates.push({
    name: '',
    number: '',
  })
}

const modalTitle = ref('')
function openModal(title: string, id?: string) {
  modalTitle.value = title
  visible.value = true
  getRoleDatas()
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
      <div class="my-4 max-h-[60vh] overflow-auto">
        <a-form
          ref="detailFormRef"
          :model="detailForm"
          :rules="rules"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-form-item label="头像" name="avatar">
            <UploadAvatar v-model:value="detailForm.avatar" />
          </a-form-item>
          <a-form-item label="用户名" name="username">
            <a-input
              v-model:value="detailForm.username"
              :maxlength="50"
              :disabled="!!detailForm.id"
              allow-clear
              placeholder="请输入用户名（创建后不可修改）"
            />
          </a-form-item>
          <a-form-item label="用户名称" name="name">
            <a-input v-model:value="detailForm.name" :maxlength="50" allow-clear placeholder="请输入用户名称" />
          </a-form-item>
          <a-form-item label="角色" name="roleIds">
            <a-select
              v-model:value="detailForm.roleIds"
              mode="multiple"
              allow-clear
              :options="rolesOptions"
              placeholder="请选择角色"
            />
          </a-form-item>
          <!-- 资质 -->
          <a-form-item class="certificate-form" label="资质">
            <div
              v-for="(item, index) in detailForm.certificates"
              :key="index"
              class="flex space-form-item"
            >
              <a-form-item
                label=" "
                :name="['certificates', index, 'name']"
                :rules="{
                  required: !!item.number,
                  message: '请输入资质证书名称',
                }"
              >
                <a-input v-model:value="item.name" :maxlength="50" allow-clear placeholder="请输入资质证书名称" />
              </a-form-item>
              <a-form-item :name="['certificates', index, 'number']" mx-2>
                <a-input v-model:value="item.number" :maxlength="50" allow-clear placeholder="请输入证书编号" />
              </a-form-item>
              <div class="flex gap-2 w-[40px] h-[32px]">
                <PlusCircleOutlined @click="addCertificate" />
                <MinusCircleOutlined v-if="detailForm.certificates.length > 1" @click="removeCertificate(item)" />
              </div>
            </div>
          </a-form-item>
          <a-form-item label="手机号" name="phone">
            <a-input v-model:value="detailForm.phone" :maxlength="20" allow-clear placeholder="请输入手机号" />
          </a-form-item>
          <a-form-item label="职位" name="title">
            <a-input v-model:value="detailForm.title" :maxlength="50" allow-clear placeholder="请输入职位" />
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
  </a-modal>
</template>

<style scoped>
.certificate-form {
  margin-bottom: 0;
}
.certificate-form .space-form-item :deep(.ant-form-item-label) {
  height: 32px;
}
.certificate-form .space-form-item :deep(.ant-form-item-label > label) {
  width: 11px;
}
.certificate-form :deep(.ant-form-item-required::after),
.certificate-form .space-form-item :deep(.ant-form-item-label > label:after) {
  display: none;
}
</style>
