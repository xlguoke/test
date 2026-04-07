<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="上传"
      :mask-closable="false"
      :confirm-loading="uploading"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <Spin :spinning="uploading">
        <div v-if="max && max > 0" style="margin-bottom: 5px">
          最多同时上传{{ max }}个文件, 支持格式：{{
            accept === 'all' ? '所有格式文件' : accept || initialAccept
          }}
        </div>
        <div v-else style="margin-bottom: 5px">
          支持格式：{{
            accept === 'all' ? '所有格式文件' : accept || initialAccept
          }}
        </div>
        <a-upload
          :file-list="fileList"
          :remove="handleRemove"
          :before-upload="beforeUpload"
          :default-file-list="fileList"
          :accept="accept === 'all' ? '' : accept || initialAccept"
          :multiple="multiple || false"
        >
          <a-button>选择文件</a-button>
        </a-upload>
      </Spin>
      <slot name="description"></slot>
    </ht-modal>
  </div>
</template>

<script>
import { message, Spin } from 'ant-design-vue'

export default {
  components: {
    Spin,
  },
  props: ['max', 'uploadcall', 'fileLists', 'accept', 'multiple'],
  data() {
    return {
      visible: false,
      fileList: [],
      uploading: false,
      isBackSubmit: false,
      data: [],
      initialAccept: '.doc, .xls, .docx, .xlsx, .pdf, .jpg, .png',
    }
  },
  watch: {
    fileLists(newValue) {
      this.fileList = [...newValue]
    },
  },
  methods: {
    showModal(isBackSubmit) {
      // eslint-disable-next-line ts/no-unused-expressions
      isBackSubmit ? (this.isBackSubmit = isBackSubmit) : ''
      this.visible = true
    },
    handleSubmit() {
      this.handleUpload()
    },
    handleCancel() {
      this.visible = false
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload(file) {
      const _accept = (this.accept || this.initialAccept).toLocaleLowerCase()
      if (_accept && this.accept !== 'all') {
        const suffix = file.name.split('.')[file.name.split('.').length - 1] || ''
        if (!_accept.includes(suffix.toLocaleLowerCase())) {
          message.warn(`上传格式不对，仅支持${_accept}文件`)
          return
        }
      }

      const num = this.max
      if (num && num > 0) {
        if (this.fileList.length >= num) {
          this.fileList.shift()
        }
      }
      this.fileList = [...this.fileList, file]

      return false
    },
    handleUpload() {
      const { fileList } = this

      const uploadFile = fileList.filter(item => item.type && item.size)

      if (uploadFile.length > 0) {
        const formData = new FormData()
        uploadFile.forEach((file) => {
          formData.append('file', file)
        })
        if (this.isBackSubmit) {
          this.uploadcall(uploadFile)
          this.visible = false
          return
        }
        this.uploading = true

        window.$oAjax({
          url: window.$oApi.common.upload,
          method: 'post',
          data: formData,
        }).then(
          (res) => {
            if (res && res.success) {
              // message.success("上传成功");
              const uploadFileUids = uploadFile.map(item => item.uid)
              let fileList = this.fileList.filter(
                item => !uploadFileUids.includes(item.uid),
              )
              fileList = fileList.map(item => ({
                ...item,
                attachmenttitle: item.name,
                id: item.uid,
                realpath: item.url,
              }))
              this.data = [...fileList, ...res.obj]

              this.uploadcall(this.data)
              this.visible = false
            }
            else {
              window.$oAntdModal.warning(
                window.$oMsgTips.info(res.msg || res.message || '上传失败'),
              )
            }
            this.uploading = false
          },
          () => {
            window.$oAntdModal.warning(window.$oMsgTips.info('上传失败'))
            this.uploading = false
          },
        )
      }
      else {
        this.uploadcall(this.fileList)
        this.visible = false
      }
    },
  },
}
</script>

<style lang="less" scoped></style>
