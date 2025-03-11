<template>
  <a-modal
    v-model:open="visible"
    title="上传"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    @ok="handleUpload"
    @cancel="cancel"
  >
    <div class="pt-2 h-[150px]">
      <p class="mb-2 text-gray-600">
        最多同时上传1个文件, 支持格式：.pdf
      </p>
      <a-upload :file-list="fileList" accept=".pdf" :before-upload="beforeUpload">
        <a-button class="flex items-center">
          <UploadOutlined />上传文件
        </a-button>
      </a-upload>
    </div>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { type UploadProps, message } from 'ant-design-vue'
import { uploadFileApi } from '../api'

export interface FileInfo {
  fileId: string
  fileName: string
  fileUrl: string
}

const emits = defineEmits<{
  (e: 'save', file?: FileInfo): void
}>()

const saveLoading = ref(false)
const visible = ref(false)
const fileList = ref<UploadProps['fileList']>([])

function getFileType(name: string) {
  const arr = name.split('.')
  return arr[arr.length - 1].toLocaleLowerCase()
}

// 文件校验
function beforeUpload(file: File, files: UploadProps['fileList']) {
  const isLt2M = file.size / 1024 / 1024 < 50
  if (!isLt2M) {
    message.error('上传文件大小不能超过 50MB!')
  }
  const isPdf = getFileType(file.name) === 'pdf'
  if (!isPdf) {
    message.error('仅支持pdf格式文件!')
  };
  if (!isLt2M || !isPdf) {
    fileList.value = []
  }
  else {
    fileList.value = files
  }
  return false
}

// 上传文件
async function handleUpload() {
  if (!fileList.value || fileList.value.length === 0) {
    emits('save')
    cancel()
    return
  }
  saveLoading.value = true
  try {
    const file = fileList.value[0] as any
    const { data } = await uploadFileApi(file)
    const res = data.obj[0]
    emits('save', {
      fileId: res.id,
      fileName: res.attachmenttitle,
      fileUrl: res.realpath,
    })
    cancel()
  }
  catch (e) {
    console.error(e)
    saveLoading.value = false
  }
}

// 关闭弹窗
function cancel() {
  visible.value = false
  fileList.value = []
}

// 打开弹窗
function showModal() {
  saveLoading.value = false
  visible.value = true
}

defineExpose({
  showModal,
})
</script>

<style>

</style>
