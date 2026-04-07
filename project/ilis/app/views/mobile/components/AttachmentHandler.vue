<template>
  <span class="attachment-handler">
    <!-- 附件上传区域 -->
    <div v-if="!readonly" class="attachment-upload-section">
      <van-uploader
        v-bind="$attrs"
        v-model="fileList"
        multiple
        :after-read="afterRead"
        :before-delete="beforeDelete"
        :deletable="!readonly"
        @click-preview="handlePreview"
      />
    </div>

    <!-- 只读模式下显示文件列表 -->
    <span v-if="readonly && fileList.length > 0" class="readonly-file-list">
      <a v-for="item in fileList" :key="item.id" src="javascript:void(0)" style="margin:0 10px 10px 0" @click="handleFile(item)">
        {{ item.name }}
      </a>
    </span>
  </span>
</template>

<script>
import { showConfirmDialog, showFailToast, showImagePreview } from 'vant'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export default {
  name: 'AttachmentHandler',
  props: {
    /** # 业务ID ⚙️ */
    businessId: {
      type: [String, Number, undefined],
    },
    /** # 业务类型 ⚙️ */
    businessType: {
      type: String,
      required: true,
    },
    /** # 二维码Key（传入后查询指定二维码下的文件） ⚙️ */
    fixedQrKey: {
      type: String,
      default: '',
    },
    /** # 是否只读模式 ⚙️ */
    readonly: {
      type: Boolean,
      default: false,
    },
    /** # 文件列表标题 ⚙️ */
    fileListTitle: {
      type: String,
      default: '已上传文件列表',
    },
    /** # 图片压缩质量（0-1） ⚙️ */
    compressQuality: {
      type: Number,
      default: 0.7,
      validator: (value) => {
        return value >= 0.1 && value <= 1
      },
    },
    /** # 是否启用图片压缩 ⚙️ */
    enableCompress: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['uploadSuccess', 'deleteSuccess', 'fileClick', 'uploadProgress', 'init'],

  data() {
    return {
      fileList: [],
      activeNames: ['0'],
      qrKey: '',
      pdfSrc: '',
      filename: '',
    }
  },

  computed: {
    /** # 文件图标背景色映射 ⚙️ */
    fileIconBgColor() {
      return window.$appConfigs.fileIconBgColor
    },
  },

  watch: {
    /** # 监听业务ID变化重新初始化 ⚙️ */
    businessId: {
      handler: 'initAttachmentHandler',
      immediate: false,
    },
    /** # 监听业务类型变化重新初始化 ⚙️ */
    businessType: {
      handler: 'initAttachmentHandler',
      immediate: false,
    },
  },

  async created() {
    await this.initAttachmentHandler()
  },

  methods: {
    /** # 初始化附件处理器 ⚙️ */
    async initAttachmentHandler() {
      if (!this.businessType) {
        return
      }

      try {
        this.qrKey = this.fixedQrKey || await this.getQrKey(this.businessId, this.businessType)
        this.$emit('init', { qrKey: this.qrKey })
        this.fileList = await this.getHistoryFile(this.qrKey)
      }
      catch (error) {
        console.error('初始化附件处理器失败:', error)
        showFailToast('附件初始化失败')
      }
    },

    /** # 获取二维码Key ⚙️ */
    async getQrKey(id, type) {
      const { data } = await IlisApiHelper.get(`rest/attachmentQR/getQrCode/${type}`, {
        businessId: id,
      })
      const qrUrl = new URL(data)
      const qrKey = qrUrl.searchParams.get('key')
      return qrKey
    },

    /** # 获取历史附件列表 ⚙️ */
    async getHistoryFile(qrKey) {
      if (!qrKey)
        return []

      const [{ data: fileData }, { data: historyFileData }] = await Promise.all([
        IlisApiHelper.get(`/rest/attachmentQR/attachments/${qrKey}?recursion=false`),
        this.businessId
          ? IlisApiHelper.get(`/rest/attachmentQR/historical/attachments/${this.businessType}`, { businessId: this.businessId })
          : Promise.resolve({ data: [] }),
      ])
      const allFiles = [...fileData || [], ...historyFileData || []]
      if (allFiles && allFiles.length) {
        allFiles.forEach((item) => {
          item._fileType = this.getFileType(item.name)
        })
      }

      return allFiles || []
    },

    /** # 文件上传后处理 ⚙️ */
    async afterRead(files) {
      if (!this.qrKey) {
        showFailToast('附件处理器未初始化完成')
        return
      }

      if (!Array.isArray(files)) {
        files = [files]
      }

      // 批量上传处理
      await this.batchUploadFiles(files)
    },

    /** # 批量上传文件 ⚙️ */
    async batchUploadFiles(files) {
      let successCount = 0
      let errorCount = 0
      files.forEach((file) => {
        file.status = 'uploading'
        file.message = '上传中...'
      })

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        try {
          await this.uploadSingleFile(file)
          file.status = 'done'
          file.message = '上传成功'
          successCount++
        }
        catch (error) {
          console.error(`文件 ${file.file.name || '未知文件'} 上传失败:`, error)
          file.status = 'failed'
          file.message = '上传失败'
          errorCount++
        }

        // 更新进度信息
        file.message = `上传中 (${i + 1}/${files.length})`
      }

      // 上传完成
      if (successCount > 0) {
        showSuccessToast(`成功上传 ${successCount} 个文件`)
        this.fileList = await this.getHistoryFile(this.qrKey)
        this.$emit('uploadSuccess', files.filter(file => file.status === 'done'))
      }

      if (errorCount > 0) {
        showFailToast(`${errorCount} 个文件上传失败`)
      }
    },

    /** # 上传单个文件 ⚙️ */
    async uploadSingleFile(file) {
      let uploadFile = file.file
      // 检查是否为图片类型且启用压缩，如果是则进行压缩
      if (this.enableCompress && this.isImageFile(file.file)) {
        try {
          uploadFile = await this.compressImage(file.file)
        }
        catch (error) {
          console.warn('图片压缩失败，使用原文件上传:', error)
          // 压缩失败时使用原文件
        }
      }

      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('businessId', this.businessId)
      formData.append('qrKey', this.qrKey)
      formData.append('uploadWay', 'WEBPAGE')
      formData.append('uploader', localStorage.getItem('userInfo')?.realName)

      await IlisApiHelper.postForm('/uploadController.do?upload', formData)
    },

    /** # 检查是否为图片文件 ⚙️ */
    isImageFile(file) {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      return imageTypes.includes(file.type)
    },

    /** # 图片压缩处理 ⚙️ */
    async compressImage(file) {
      return new Promise((resolve, reject) => {
        // 检查是否启用压缩
        if (!this.enableCompress) {
          resolve(file)
          return
        }

        const reader = new FileReader()

        reader.onload = (event) => {
          const img = new Image()
          img.onload = () => {
            try {
              // 创建Canvas进行压缩
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')

              // 设置Canvas尺寸为图片原始尺寸
              canvas.width = img.width
              canvas.height = img.height

              // 绘制图片到Canvas
              ctx.drawImage(img, 0, 0, img.width, img.height)

              // 使用配置的压缩质量
              const quality = this.compressQuality

              // 获取压缩后的DataURL
              const compressedDataURL = canvas.toDataURL('image/jpeg', quality)

              // 将DataURL转换为File对象
              const compressedFile = this.dataURItoBlob(compressedDataURL, file.name)

              resolve(compressedFile)
            }
            catch (error) {
              reject(error)
            }
          }

          img.onerror = () => {
            reject(new Error('图片加载失败'))
          }

          img.src = event.target.result
        }

        reader.onerror = () => {
          reject(new Error('文件读取失败'))
        }

        reader.readAsDataURL(file)
      })
    },

    /** # DataURL转换为Blob对象 ⚙️ */
    dataURItoBlob(dataURL, filename) {
      const arr = dataURL.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)

      if (!mimeMatch) {
        throw new Error('无效的DataURL格式')
      }

      const mime = mimeMatch[1]
      const bstr = atob(arr[1])
      const n = bstr.length
      const u8arr = new Uint8Array(n)

      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i)
      }

      return new File([u8arr], filename, { type: mime })
    },

    /** # 获取文件类型 ⚙️ */
    getFileType(name) {
      if (name) {
        const arr = name.split('.')
        const type = arr[arr.length - 1].toLocaleUpperCase()
        return type
      }
      return 'other'
    },

    /** # 处理文件预览点击事件 ⚙️ */
    handlePreview(file) {
      // 如果是上传中的文件，不处理预览
      if (file.status && file.status !== 'done') {
        return
      }

      // 如果是历史文件（有 url 但没有 file 属性），使用原有的预览逻辑
      if (file.url && !file.file) {
        this.handleFile(file)
        return
      }

      // 如果是新上传的图片文件，使用图片预览
      if (file.file && this.isImageFile(file.file)) {
        const reader = new FileReader()
        reader.onload = (event) => {
          showImagePreview({ closeable: true, images: [event.target.result] })
        }
        reader.readAsDataURL(file.file)
      }

      // 如果是历史图片文件，直接预览
      if (file.url && ['JPG', 'JPEG', 'PNG'].includes(file._fileType)) {
        showImagePreview({ closeable: true, images: [file.url] })
      }
    },

    /** # 删除文件前确认 ⚙️ */
    beforeDelete(file) {
      return new Promise((resolve, reject) => {
        showConfirmDialog({
          title: '提示',
          message: `确认删除附件: ${file.file ? file.file.name : file.name}?`,
        })
          .then(async () => {
            // 如果是历史文件（有 attachmentId），需要调用后端删除接口
            if (file.attachmentId) {
              try {
                await IlisApiHelper.delete(`/rest/attachmentQR/fileDel?key=${this.qrKey}&attachmentId=${file.attachmentId}`)
                showSuccessToast('删除成功')
                // 从历史文件列表中移除
                this.$emit('deleteSuccess', file)
                resolve(true)
              }
              catch (error) {
                console.error('删除历史文件失败:', error)
                showFailToast('删除失败')
                reject(error)
              }
            }
            else {
              // 上传中的文件由Vant Uploader自动管理，直接允许删除
              resolve(true)
            }
          })
          .catch(() => {
            reject(new Error('用户取消删除'))
          })
      })
    },

    /** # 处理文件点击事件 ⚙️ */
    handleFile(row) {
      const fileType = row._fileType

      if (['JPG', 'JPEG', 'PNG'].includes(fileType)) {
        showImagePreview({ closeable: true, images: [row.url] })
      }
      else if (fileType === 'PDF') {
        this.pdfSrc = row.url
        this.filename = row.name
        this.viewPDF()
      }
      else {
        downloader.excute(row.url, row.name)
      }

      this.$emit('fileClick', row)
    },

    /** # 预览PDF文件 ⚙️ */
    viewPDF() {
      this.$router.push({
        name: 'PDFPreview',
        params: {
          src: this.pdfSrc,
          filename: this.filename,
        },
      })
    },

    /** # 手动刷新附件列表 ⚙️ */
    async refreshFileList() {
      if (this.qrKey) {
        this.fileList = await this.getHistoryFile(this.qrKey)
      }
    },

    /** # 获取当前附件列表 ⚙️ */
    getCurrentFileList() {
      return this.fileList
    },
  },
}
</script>

<style lang="less" scoped>
.attachment-handler {
  .attachment-upload-section {
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .attachment-file-list {
    .attachment-file-row {
      padding: 8px 0;
      background: #fff;
      border-top: 1px solid #ebedf0;
      display: flex;
      align-items: center;

      &:first-child {
        border-top: 0;
      }

      &::after {
        content: "";
        display: block;
        height: 1px;
        clear: both;
      }
    }

    .attachment-file-icon {
      float: left;
      width: 46px;
      height: 46px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      overflow: hidden;
      color: #fff;
      margin-right: 4px;
      font-size: 12px;
    }

    .attachment-file-info {
      overflow: hidden;
      padding-left: 8px;
      flex: 1;
      display: flex;
      align-items: center;

      .name {
        flex: 1;
        margin-right: 8px;
      }
    }
  }

  .attachment-notData {
    :deep(.van-empty__image) {
      width: 80px;
      height: auto;
    }
  }
}

.textOverflow {
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  flex: 1;
}
</style>
