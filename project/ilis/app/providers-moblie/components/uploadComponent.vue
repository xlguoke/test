<template>
  <div>
    <a-modal
      v-model:open="visible"
      title="上传"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <div style="margin-bottom: 5px">
        最多上传{{ max || 1 }}个文件, 支持格式：{{
          accept || 'doc, xls, docx, xlsx, pdf, jpg, png'
        }}
      </div>
      <a-upload
        :file-list="fileList"
        :remove="handleRemove"
        :before-upload="beforeUpload"
        :default-file-list="fileList"
        :accept="accept"
      >
        <a-button> <UploadOutlined /> 选择文件 </a-button>
      </a-upload>
      <a-button
        type="primary"
        :disabled="fileList.length === 0 || isComplete"
        :loading="uploading"
        style="margin-top: 16px"
        @click="handleUpload"
      >
        {{ uploading ? '上传中' : '开始上传' }}
      </a-button>
    </a-modal>
  </div>
</template>

<script>
import { UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'

export default {
  components: {
    UploadOutlined,
  },
  props: ['max', 'uploadcall', 'fileLists', 'accept'],
  data() {
    return {
      visible: false,
      fileList: [],
      uploading: false,
      data: [],
      isComplete: false,
    }
  },
  watch: {
    fileLists(newValue) {
      this.fileList = [...newValue]
    },
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleSubmit() {
      this.visible = false
      this.uploadcall(this.data)
    },
    handleCancel() {
      this.data.length = 0
      this.uploadcall(this.data)
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload(file) {
      if (this.accept) {
        // eslint-disable-next-line no-eval
        const reg = eval(`/\.(${file.name.split('.')[1]})$/`)
        if (!reg.test(this.accept)) {
          message.warn(`上传格式不对，仅支持${this.accept}文件`)
          return
        }
      }

      const num = this.max || 1
      if (this.fileList.length >= num) {
        this.fileList.shift()
      }
      this.fileList = [...this.fileList, file]
      this.isComplete = false
      return false
    },
    handleUpload() {
      const { fileList } = this
      const formData = new FormData()
      fileList.forEach((file) => {
        formData.append('file', file)
      })
      this.uploading = true

      mAjax({
        url: mApi.common.upload,
        method: 'post',
        data: formData,
      }).then((res) => {
        this.isComplete = true
        if (res && res.success) {
          message.success('上传成功')
          this.data = res.obj
        }
        else {
          message.success('上传失败')
        }
        this.uploading = false
      })
    },
  },
}
</script>

<style lang="less" scoped></style>
