<template>
  <van-uploader
    v-model="fileList"
    :show-upload="!readonly"
    :deletable="!readonly"
    :after-read="afterRead"
    :before-delete="beforeDelete"
  />
</template>

<script lang="ts" setup>
import { deleteAttachment, getAttachmentByQrCode, getQrCode, parseQrCodeUrl, upload } from '@/api/uploader'
import type { UploaderFileListItem } from 'vant'

const props = defineProps({
  businessId: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const qrCodeKey = ref('')

const businessId = computed(() => props.businessId)

const readonly = computed(() => props.readonly)

const fileList = ref<UploaderFileListItem[]>([])

init()

async function init() {
  const res = await getQrCode(businessId.value)
  qrCodeKey.value = parseQrCodeUrl(res.data)

  getFileList()
}

async function getFileList() {
  const res = await getAttachmentByQrCode(qrCodeKey.value)

  fileList.value = res.data.map(i => ({
    url: i.url,
    status: 'done',
    id: i.attachmentId,
  }))
}

async function afterRead(file) {
  file.status = 'uploading'
  file.message = '上传中...'

  const res: any = await upload({
    file: file.file,
    qrKey: qrCodeKey.value,
    uploadWay: 'WEBPAGE',
  }).catch(() => {})

  if (res.code !== 20010) {
    getFileList()
  }
  else {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

async function beforeDelete(item): Promise<boolean> {
  return new Promise((resolve) => {
    showConfirmDialog({
      title: '提示',
      message: '确认删除吗？',
    }).then(async () => {
      await deleteAttachment({
        key: qrCodeKey.value,
        attachmentId: item.id,
      })
      resolve(true)
      getFileList()
      showSuccessToast('已删除')
    }).catch(() => {
      resolve(false)
    })
  })
}
</script>
