<template>
  <van-uploader
    v-bind="$attrs"
    v-model="fileList"
    :after-read="afterRead"
    @click-preview="handlePreview"
  />

  <!-- 查看PDF -->
  <MobileCheckPDF ref="mobileCheckPDFRef" />
</template>

<script>
import { showImagePreview } from 'vant'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore'

export default {
  name: 'UploadWithQrKey',
  components: {
    MobileCheckPDF,
  },
  props: {
    businessId: { type: String, default: '', required: true },
    businessType: { type: String, default: '', required: true },
    value: { type: String, default: '' },
  },
  emits: ['update:value'],
  data() {
    return {
      fileList: [],
      qrKey: '',
    }
  },
  async created() {
    if (!this.value) {
      this.qrKey = await this.getQrKey(this.businessId, this.businessType)
      this.$emit('update:value', this.qrKey)
    }
    else {
      this.qrKey = this.value
    }
    this.fileList = await this.getHistoryFile(this.qrKey)
  },
  methods: {
    async getQrKey(id, type) {
      const { code, data } = await mRequest.get(api.common.getQrCodeLink(type), {
        params: { businessId: id },
      })
      if (code !== 20000) {
        return showFailToast(data.msg || data.message || '获取历史附件失败')
      }
      const qrUrl = new URL(data)
      const qrKey = qrUrl.searchParams.get('key')
      return qrKey
    },
    async getHistoryFile(qrKey) {
      const { code: fileCode, data: fileData } = await mRequest.get(api.common.getAttachmentByKey(qrKey))
      if (fileCode !== 20000) {
        return showFailToast(fileData.msg || fileData.message || '获取历史附件失败')
      }
      // 处理文件列表，确保非图片文件有正确的 name 属性用于显示
      const files = (fileData || []).map((file) => {
        const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP'].includes((file.format || '').toUpperCase())
        if (!isImage && file.name) {
          // 对于非图片文件，设置 file 属性让 Uploader 正确显示文件名
          return {
            ...file,
            file: { name: file.name },
          }
        }
        return file
      })
      return files
    },
    async  afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      formData.append('businessId', this.businessId)
      formData.append('qrKey', this.qrKey)
      formData.append('uploadWay', 'WEBPAGE')

      const { userInfo } = useAppUserStore()
      formData.append('uploader', userInfo.userName)

      const { fail } = await mRequest.post(api.common.upload, formData)

      if (fail) {
        return showFailToast(data.msg || data.message || '上传失败!')
      }
      file.status = 'success'
      file.message = '上传成功!'
      showSuccessToast('上传成功!')
      this.fileList = await this.getHistoryFile(this.qrKey)
    },
    handlePreview(file) {
      const fileType = file.format.toUpperCase()

      if (['JPG', 'JPEG', 'PNG'].includes(fileType)) {
        showImagePreview({ closeable: true, images: [file.url] })
      }
      else if (fileType === 'PDF') {
        this.$refs.mobileCheckPDFRef.open(file.url, file.name)
      }
      else {
        downloadFile(file.url, file.name)
      }
    },
  },
}
</script>

<style scoped>
:deep(.van-uploader__wrapper--disabled .van-uploader__preview-delete){
  display: none;
}
</style>
