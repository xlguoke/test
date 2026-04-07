<template>
  <a-form
    ref="formRef"
    :model="formData"
    :disabled="isDetail"
    :label-col="{
      span: 3,
    }"
    :rules="formRules"
  >
    <a-form-item label="处理方式" required name="method">
      <a-select v-model:value="formData.method" :placeholder="isDetail ? '' : '请选择处理方式'" class="w-full">
        <a-select-option v-for="item in strategyData" :key="item.typecode" :value="item.typename">
          {{ item.typename }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="处理说明">
      <a-textarea v-model:value="formData.description" :placeholder="isDetail ? '' : '请输入处理说明'" style="height: 90px;" :maxlength="500" />
    </a-form-item>

    <a-form-item label="附件">
      <a-button v-show="!isDetail" class="flex items-center" @click="showUpload = true">
        <UploadOutlined />
        上传文件
      </a-button>
      <AttachmentList v-if="verificationFiles.length > 0" :datas="verificationFiles" :show-del="showFileDel" class="mt-2" />
    </a-form-item>
  </a-form>
  <IlisUpload v-model:show="showUpload" force multiple @success="getUploadFile" />
</template>

<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import type { Attachment } from '~/components/attachmentList/index.ts'
import { UploadOutlined } from '@ant-design/icons-vue'
import { getListByGroupId } from '~/api/common'

interface IDisposeData {
  method?: string
  description?: string
  file?: any
  attachments?: any
}

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  initData: {
    type: Object as PropType<IDisposeData>,
    default: () => ({}),
  },
  showFileDel: {
    type: Boolean,
    default: true,
  },
})

watch(() => props.initData, () => {
  initData()
})

/**
 * 文件处理
 */
const showUpload = ref(false)
const verificationFiles = ref<Attachment[]>([])
function uploadFields(files: any[]) {
  return files?.map(item => ({
    name: item.attachmenttitle || item.attachmentTitle,
    url: item.realpath,
    id: item.id,
  }))
}
// 上传文件回调
function getUploadFile(files: any[]) {
  verificationFiles.value.push(...uploadFields(files))
}

const formData = ref<IDisposeData>({
  method: '',
  description: '',
  file: undefined,
})
// 初始化表单数据
function initData() {
  formData.value = {
    method: props.initData?.method ? props.initData.method : undefined,
    description: props.initData?.description ?? '',
  }
  verificationFiles.value = uploadFields(props.initData?.attachments || [])
}
initData()
// 获取表单数据
const formRef = ref()
function getFormData() {
  return {
    method: formData.value.method,
    description: formData.value.description,
    attachmentIds: verificationFiles.value.map(item => item.id),
  }
}
// 表单验证规则
const formRules: Record<string, Rule[]> = {
  method: [
    {
      required: true,
      message: '请输入处理方式',
      trigger: 'blur',
    },
  ],
}
// 表单验证方法
async function validateForm() {
  try {
    if (formRef.value) {
      await formRef.value.validate()
      return true
    }
    else {
      return false
    }
  }
  catch (error) {
    console.error(error)
    return false
  }
}
const strategyData = ref<any>([])
// 初始化处理方法数据
async function initSelectData() {
  const res = await getListByGroupId('TEST_WARNING_HANDLE_STRATEGY')
  strategyData.value = res?.data?.obj || []
}
initSelectData()
defineExpose({
  getFormData,
  validateForm,
})
</script>
