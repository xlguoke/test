<template>
  <div class="h5_page">
    <header class="header">
      附件上传助手
    </header>
    <div class="upload-banner">
      <img
        class="bg"
        :src="importImage('h5-qr-banner.svg')"
        alt=""
      />
      <img
        class="con"
        :src="importImage('h5-qr-banner-con.svg')"
        alt=""
      />
    </div>
    <div class="list_wrap">
      <ul>
        <li v-if="isUnvalidQR" class="empty-list">
          <img :src="importImage('h5-unvalid-qr.svg')" />
          二维码已失效！
        </li>
        <li v-else-if="fileList.length === 0" class="empty-list">
          <img :src="importImage('h5-no-data.svg')" />
          暂未上传附件信息，快点击下方加号上传吧~
        </li>
        <template v-else>
          <li v-for="item in fileList" :key="item.id" class="file-item">
            <div>
              <img v-if="IS_IMAGE(item.format)" :src="item.url" />
              <div v-else class="type_icon">
                <FileWordFilled
                  v-if="IS_WORD(item.format)"
                  class="file-type"
                />
                <FileExcelFilled
                  v-else-if="IS_EXCEL(item.format)"
                  class="file-type"
                />
                <FilePptFilled
                  v-else-if="IS_PPT(item.format)"
                  class="file-type"
                />
                <FilePdfFilled
                  v-else-if="IS_PDF(item.format)"
                  class="file-type"
                />
                <FileZipFilled
                  v-else-if="IS_ZIP(item.format)"
                  class="file-type"
                />
                <div v-else-if="IS_VIDEO(item.format)" class="video-camera">
                  <FileFilled class="file-type" />
                  <VideoCameraFilled />
                </div>
                <FileUnknownFilled
                  v-else
                  class="file-type"
                />
              </div>
            </div>
            <div class="file-info">
              <p class="file-name">
                {{ item.name }}
              </p>
              <p class="file-size-type">
                <span>大小：{{ item.size }}</span>
                <span>格式：{{ item.format }}</span>
              </p>
              <p class="upload-user">
                <span>{{ item.uploader || '-' }}</span>
                <span>{{ item.uploadTime || '-' }}</span>
              </p>
              <div class="file-btns">
                <template v-if="!isWeChat">
                  <a-button
                    v-if="IS_PDF(item.format) || IS_IMAGE(item.format)"
                    type="primary"
                    @click="previewFile(item)"
                  >
                    预览
                  </a-button>
                  <a-button
                    type="primary"
                    :loading="item.loading"
                    @click="downloadFile(item)"
                  >
                    下载
                  </a-button>
                </template>
                <a-button danger @click="delFile(item)">
                  删除
                </a-button>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>
    <footer v-if="!isUnvalidQR" class="footer">
      <a-upload
        :show-upload-list="false"
        name="file"
        :multiple="true"
        :file-list="[]"
        :disabled="disabledUpload"
        :before-upload="beforeUpload"
      >
        <a-button type="primary" :loading="loading" block @click="clickUploadFile">
          <PlusOutlined />
          点击上传
        </a-button>
      </a-upload>
      <a-button type="primary" @click="goPhotoManage">
        <CameraOutlined />
        拍照组合生成PDF
      </a-button>
      <div class="upload-hint">
        <p>1、支持上传格式：{{ accepts }}</p>
        <p>2、单个文件大小不超过50M</p>
        <p v-if="inviteKey">
          3、最多允许上传5个文件
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { CameraOutlined, FileExcelFilled, FileFilled, FilePdfFilled, FilePptFilled, FileUnknownFilled, FileWordFilled, FileZipFilled, PlusOutlined, VideoCameraFilled } from '@ant-design/icons-vue'
import ajax from '~/providers/common/ajax'
import { debounce, getQueryVariable } from '~/providers/common/utils'
import { useVue2MigrationStore } from '~/store/vue2MigrationStore'

const defaultAccepts = 'jpg,jpeg,png,bmp,svg,pdf,xls,xlsx,doc,docx,zip,rar,mp4'
let timer
export default {
  components: {
    CameraOutlined,
    FileExcelFilled,
    FileFilled,
    FilePdfFilled,
    FilePptFilled,
    FileUnknownFilled,
    FileWordFilled,
    FileZipFilled,
    PlusOutlined,
    VideoCameraFilled,
  },
  setup() {
    const vue2MigrationStore = useVue2MigrationStore()
    return { vue2MigrationStore }
  },
  data() {
    return {
      isUnvalidQR: false,
      accepts: '',
      loading: false,
      key: getQueryVariable('key') || '',
      unitCode: getQueryVariable('uc') || '',
      /** 邀请二维码：存在该参数时，表示通过扫描邀请二维码进入 */
      inviteKey: getQueryVariable('inviteKey') || '',
      businessId: '',
      businessType: getQueryVariable('type') || '',
      fileList: [],
      validFail: [],
      uploadError: {},
      count: 0,
      totalFile: 0,
      uploadFiles: [],
      isWeChat: false, // 是否在微信浏览器打开
    }
  },
  computed: {
    disabledUpload() {
      return !!this.inviteKey && this.fileList.length >= 5
    },
  },
  watch: {
    $route(to, from) {
      if (to.name === 'photoManage') {
        clearTimeout(timer)
      }
      else if (to.name === 'list' && from.name === 'photoManage') {
        this.getFilesList(true)
        this.uploadMergeFDF()
      }
    },
  },
  created() {
    const _id = getQueryVariable('id') || ''
    const accepts = getQueryVariable('accepts')
    this.businessId = (_id === 'null' || _id === 'undefined') ? '' : _id
    this.accepts = accepts ? decodeURIComponent(accepts) : defaultAccepts
    if (this.inviteKey || this.key) {
      this.getFilesList()
    }
    else {
      window.$oAntdMessage.error('未获取到key值')
    }
    this.isWeChat = navigator.userAgent.toLowerCase().includes('micromessenger')
  },
  methods: {
    importImage(filename) {
      return new URL(`/assets/img/${filename}`, import.meta.url)
    },
    getFileType(name) {
      const _type = name.split('.').pop()
      return _type.toLowerCase()
    },
    IS_IMAGE(type) {
      return ['jpg', 'jpeg', 'png', 'bmp'].includes(type.toLowerCase())
    },
    IS_PDF(type) {
      return ['pdf'].includes(type.toLowerCase())
    },
    IS_PPT(type) {
      return ['ppt'].includes(type.toLowerCase())
    },
    IS_EXCEL(type) {
      return ['xls', 'xlsx'].includes(type.toLowerCase())
    },
    IS_WORD(type) {
      return ['doc', 'docx'].includes(type.toLowerCase())
    },
    IS_ZIP(type) {
      return ['zip', 'rar'].includes(type.toLowerCase())
    },
    IS_VIDEO(type) {
      return ['mp4'].includes(type.toLowerCase())
    },
    beforeUpload(file, fileList) {
      this.loading = true
      const _type = this.getFileType(file.name)
      let validType = 1
      let validSize = 1

      this.totalFile = fileList.length
      // 判断文件类型
      if (!this.accepts.includes(_type)) {
        validType = 0
        this.validFail.push({
          type: 'type',
          fileName: file.name,
        })
      }
      // 判断文件大小
      if (file.size > 50 * 1024 * 1024) {
        validSize = 0
        this.validFail.push({
          type: 'size',
          fileName: file.name,
        })
      }
      if (!validType || !validSize) {
        this.uploadFinish()
        return false
      }
      this.uploadFiles.push(file)
      debounce(async () => {
        for (let i = 0; i < this.uploadFiles.length; i++) {
          const _file = this.uploadFiles[i]
          await this.upladFiles(_file)
        }
      }, 300)
      return true
    },
    async upladFiles(file) {
      const hide = window.$oAntdMessage.loading('上传中...', 0)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('qrKey', this.inviteKey || this.key)
      try {
        const res = await ajax({
          method: 'post',
          url: `rest/p-ul/upload`,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Unit-Code': this.unitCode,
          },
        })
        if (res.code !== 20000) {
          throw res
        }
        hide()
        this.uploadFinish()
      }
      catch (error) {
        hide()
        const msg = error.msg || error.message || '因系统异常，上传失败'
        if (!this.uploadError[msg])
          this.uploadError[msg] = []
        this.uploadError[msg].push(file.name)
        this.uploadFinish()
      }
      return true
    },
    uploadFinish() {
      this.count++
      if (this.count >= this.totalFile) {
        let sizeMsg = ''
        let typeMsg = ''
        let errMsg = ''
        for (let i = 0; i < this.validFail.length; i++) {
          const item = this.validFail[i]
          if (item.type === 'size') {
            sizeMsg += `[${item.fileName}]`
          }
          else if (item.type === 'type') {
            typeMsg += `[${item.fileName}]`
          }
        }
        for (const k in this.uploadError) {
          const v = this.uploadError[k]
          v.forEach((item) => {
            errMsg += `[${item}]`
          })
          errMsg += `${k};`
        }
        if (sizeMsg || typeMsg || errMsg) {
          const msg = `${typeMsg}${
            typeMsg ? '的文件格式不支持上传；' : ''
          }${sizeMsg}${sizeMsg ? '的文件大小超出限制；' : ''}${errMsg}`
          window.$oAntdModal.error({
            title: '上传失败!',
            content: msg,
            centered: true,
            okText: '确定',
          })
        }

        this.getFilesList()
        this.loading = false
        this.uploadFiles = []
        this.validFail = []
        this.uploadError = {}
        this.count = 0
        this.totalFile = 0
      }
    },
    // 删除合成后的pdf文件
    uploadMergeFDF() {
      const mergePDF = this.vue2MigrationStore.mergePDF
      if (!mergePDF) {
        return
      }
      this.upladFiles(mergePDF)
      this.vue2MigrationStore.clearMergeFile()
    },
    async getFilesList(flag) {
      let hide
      if (!flag) {
        hide = window.$oAntdMessage.loading('数据请求中...', 0)
      }
      try {
        const v = await ajax({
          method: 'get',
          url: `rest/p-ul/files`,
          params: {
            key: this.inviteKey || this.key,
            unitCode: this.unitCode,
            businessId: this.businessId,
            businessObj: this.businessType,
          },
          headers: {
            'Unit-Code': this.unitCode,
          },
        })
        if (v.code === 20000) {
          this.fileList = v.data.map(d => ({
            ...d,
            loading: false,
          }))
        }
        else {
          this.isUnvalidQR = true
          this.fileList = []
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.msg || '请求错误！')
      }

      hide && hide()

      clearTimeout(timer)
      timer = setTimeout(() => {
        this.getFilesList(true)
      }, 3000)
    },
    previewFile(file) {
      if (this.IS_IMAGE(file.format) || this.IS_PDF(file.format)) {
        if (file.format === 'bmp') {
          const win = window.open('')

          win
          && win.document.write(
            `<div style="height: calc(100% + 16px);display:flex;justify-content: center;align-items: center;background:#111;margin: -8px;"><img src="${file.url}"/></div>`,
          )
        }
        else {
          window.open(file.url, '_blank')
        }
      }
      else {
        this.downloadFile(file)
      }
    },
    delFile(file) {
      window.$oAntdConfirm({
        title: '您正在删除已上传文件!',
        content: '文件删除后将无法恢复，您确定要删除已上传的文件吗？',
        okText: '确定',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          const hide = window.$oAntdMessage.loading('删除中...', 0)
          try {
            const params = {
              key: this.inviteKey || this.key,
              attachmentId: file.attachmentId,
              businessObj: this.businessType,
            }
            if (file.historical) {
              // 历史数据
              delete params.attachmentId
              params.businessAttachmentId = file.businessAttachmentId
              params.businessId = file.businessId
            }
            const res = await ajax({
              method: 'delete',
              url: `rest/p-ul/fileDel`,
              params,
              headers: {
                'Unit-Code': this.unitCode,
              },
            })
            if (res.code === 20000) {
              window.$oAntdMessage.success('删除成功！')
              this.getFilesList()
            }
            else {
              throw res
            }
          }
          catch (err) {
            window.$oAntdMessage.error(err.msg || '删除失败')
          }
          hide()
        },
      })
    },
    downloadFile(file) {
      file.loading = true
      ajax({
        url: file.url,
        method: 'get',
        responseType: 'blob',
      })
        .then((res) => {
          const blob = new Blob([res])
          const elink = document.createElement('a')
          elink.download = file.name
          elink.style.display = 'none'
          elink.href = window.URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          document.body.removeChild(elink)
          file.loading = false
        })
        .catch(() => {
          file.loading = false
        })
    },
    clickUploadFile() {
      if (this.disabledUpload) {
        window.$oAntdMessage.warning('最多上传5个文件')
      }
    },
    goPhotoManage() {
      if (this.disabledUpload) {
        window.$oAntdMessage.warning('最多上传5个文件')
        return
      }
      this.$router.push({
        path: '/photoManage',
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
