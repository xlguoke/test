<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="samplingManage-upload">
    <a-upload
      v-bind="$attrs"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :list-type="listType"
      :accept="accept"
      :disabled="readOnly"
      @preview="handlePreview"
      @change="handleChange"
    >
      <div v-if="!readOnly && listType == 'picture-card'">
        <PlusOutlined style="font-size: 38px; color: #ccc" />
      </div>
      <div v-else-if="!readOnly && listType != 'picture-card'">
        <a-button :type="`${type ? type : 'default'}`">
          点击上传
        </a-button>
      </div>
    </a-upload>

    <ht-modal :open="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </ht-modal>
  </div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    PlusOutlined,
  },
  props: ['accept', 'max', 'readOnly', 'listType', 'type'],
  data() {
    return {
      loading: false,
      imageUrl: '',
      fileList: [],
      previewVisible: false,
      previewImage: '',
    }
  },
  methods: {
    loadFileList() {},
    getFileList() {
      const fileList = JSON.parse(JSON.stringify(this.fileList))
      return fileList
    },
    handleCancel() {
      this.previewVisible = false
    },
    async handlePreview(file) {
      let { extend } = file
      extend = extend.toLocaleLowerCase()
      if (extend === 'jpg' || extend === 'png' || extend === 'jpeg') {
        this.previewImage = file.url
        this.previewVisible = true
      }
      else {
        window.open(file.realpath || file.url)
      }
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload(file) {
      if (this.accept) {
        const _accept = this.accept.toLocaleLowerCase()
        const suffix = file.name.split('.')[file.name.split('.').length - 1] || ''
        if (!_accept.includes(suffix.toLocaleLowerCase())) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(`上传格式不对，仅支持${this.accept}文件`),
          )
          return false
        }
      }

      if (this.max && this.fileList.length >= this.max) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`最多上传${this.max}个附件`))
        return false
      }
    },
    handleChange(info) {
      const file = info.file

      if (file.status === 'removed') {
        this.deleteFile(file)
      }
      else {
        this.uploadFile(file.originFileObj)
      }
    },
    deleteFile(file) {
      this.fileList = this.fileList.filter(item => item.id !== file.id)
    },
    uploadFile(file) {
      const formData = new FormData()
      formData.append('file', file)

      this.fileList.push({
        uid: 0,
        name: file.name,
        status: 'uploading',
      })

      window.$oAjax({
        url: window.$oApi.common.upload,
        method: 'post',
        data: formData,
      }).then(
        (res) => {
          if (res && res.success) {
            window.$oAntdMessage.success('上传成功')
            let file = res.obj
            if (file && file.length > 0) {
              file = file[0]
              this.fileList = this.fileList.map((item) => {
                if ((item.uid === 0 || item.uid.includes('__AUTO__')) && item.status === 'uploading') {
                  return {
                    ...file,
                    status: 'done',
                    uid: file.id,
                    name: file.attachmenttitle,
                    url: file.realpath,
                  }
                }
                else {
                  return item
                }
              })
            }
          }
          else {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(res.msg || res.message || '上传失败'),
            )
            this.fileList.pop()
          }
        },
        () => {
          window.$oAntdModal.warning(window.$oMsgTips.info('上传失败'))
          this.fileList.pop()
        },
      )
    },
    setFileList(fileList) {
      this.fileList = fileList.map(item => ({
        ...item,
        url: item.url || item.realpath,
        uid: item.uid || item.id,
        name: item.name || item.attachmenttitle,
      }))
    },
    clearFileList() {
      this.fileList = []
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-upload-list-picture-card ) {
  .ant-upload-list-item-uploading-text {
    text-align: center;
    font-size: 12px;
    margin-top: 35px;
  }
}
</style>
