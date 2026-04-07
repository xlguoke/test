<template>
  <ht-modal
    v-model:open="internalOpen"
    title="上传"
    :mask-closable="false"
    :confirm-loading="uploading"
    @ok="handleUpload"
    @cancel="internalOpen = false"
  >
    <div class="min-h-[200px]">
      <a-upload-dragger
        :file-list="fileList"
        :before-upload="beforeUpload"
        :default-file-list="fileList"
        :accept="accept.join(',')"
        :multiple="multiple "
        @remove="handleRemove"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined></InboxOutlined>
        </p>
        <p class="ant-upload-text">
          单击或拖动文件到此区域进行上传
        </p>
        <div class="ant-upload-hint">
          <div v-if="max && max > 0" style="margin-bottom:4px;">
            最多同时上传{{ max }}个文件, 支持格式：{{ accept.join(',') }}
          </div>
          <div v-else style="margin-bottom:4px;">
            支持格式：{{ accept.join(',') }}
          </div>
          <div>上传文件大小不能超过 {{ size }}M </div>
        </div>
      </a-upload-dragger>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = withDefaults(defineProps<{
  /**
   * # 是否展示弹窗
   */
  show: boolean
  /**
   * # 文件类型
   */
  accept?: string[]
  /**
   * # 上传数量限制
   */
  max?: number
  /**
   * # 文件大小，单位M，默认500M
   */
  size?: number
  /**
   * # 是否多选
   */
  multiple?: boolean
  /**
   * # 上传文件
   */
  fileList?: UploadFile[]
  /**
   * # 每次打开刷新数据
   */
  force?: boolean
}>(), {
  show: false,
  accept: () => ['.doc', '.xls', '.docx', '.xlsx', '.pdf', '.jpg', 'jpeg', '.png'],
  size: 500,
  multiple: false,
  force: false,
})

const emits = defineEmits<{
  (e: 'success', data: Record<string, any>[]): void
  (e: 'update:show', value: boolean): void
}>()

const internalOpen = ref(props.show)

const uploading = ref(false)

const fileList = ref<UploadFile[]>([])

watch(() => props.show, (val) => {
  if (!val && props.force) {
    fileList.value = []
  }
  internalOpen.value = val
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

watch(() => props.fileList, (val) => {
  fileList.value = val || []
})

function handleRemove(file: any) {
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

function beforeUpload(file: any) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) {
    message.warn('无法识别文件格式')
    return
  }
  if (file.size === 0) {
    message.warn('文件损坏，无法上传（文件大小为0）')
    return
  }
  const reg = new RegExp(`\\${props.accept?.map(ext => ext.toLowerCase()).join('|')}`, 'i')
  if (!reg.test(`.${extension}`)) {
    message.warn(`上传格式不对，仅支持${props.accept?.join(',')}文件`)
    return
  }
  if (file.size > props.size * 1024 * 1024) {
    message.warn(`上传文件过大，最大支持${props.size}M文件`)
    return
  }
  if (props.max && props.max > 0) {
    if (fileList.value.length >= props.max) {
      fileList.value.shift()
    }
  }
  fileList.value = [...fileList.value, file]

  return false
}

async function handleUpload() {
  const uploadFile = fileList.value.filter(item => (item.type && item.size))
  if (uploadFile.length > 0) {
    const formData = new FormData()
    uploadFile.forEach((file: any) => {
      formData.append('file', file)
    })
    uploading.value = true
    const { data: res } = await ilisAxios.post('/uploadController.do?upload', formData).catch(() => {
      return message.warning('上传失败')
    }).finally(() => {
      uploading.value = false
    })
    const uploadFileUids = uploadFile.map(item => item.uid)
    let fileArr = fileList.value.filter(item => (!uploadFileUids.includes(item.uid)))
    fileArr = fileArr.map(item => ({
      ...item,
      attachmenttitle: item.name,
      id: item.uid,
      realpath: item.url,
    }))
    const data = [
      ...fileArr,
      ...res.obj,
    ]
    emits('success', data)
    internalOpen.value = false
  }
  else {
    emits('success', fileList.value)
    internalOpen.value = false
  }
}
</script>

<style scoped>
:deep(.ant-upload-drag){
  height: 128px;
}
</style>
