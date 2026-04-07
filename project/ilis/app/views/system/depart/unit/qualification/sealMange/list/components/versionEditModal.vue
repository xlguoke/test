<template>
  <div>
    <ht-modal
      v-model:open="_value"
      :title="modalTitle"
      :mask-closable="false"
      width="640px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form
            ref="ruleForm"
            :model="dataObj"
            :rules="rules"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item label="启用/截止日期" name="rangeDate">
              <a-range-picker
                v-model:value="dataObj.rangeDate"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
            <a-form-item label="电子章信息" name="sealType">
              <a-input
                v-model:value="dataObj.chapter"
                placeholder="请输入电子章信息"
                :max-length="80"
              />
            </a-form-item>
            <a-form-item label="印章图片" name="sealStampFileId">
              <div
                v-if="dataObj.sealStampFilePath"
                class="img-box"
                @click="onCheckImg"
              >
                <img :src="dataObj.sealStampFilePath" />
              </div>
              <a-upload
                name="file"
                :multiple="false"
                :show-upload-list="false"
                accept=".png"
                :before-upload="beforeUploadImg"
              >
                <a-button

                  type="primary"
                  :loading="uploadImgLoading"
                >
                  {{ dataObj.sealStampFileId ? '重新上传' : '上传文件' }}
                </a-button>
              </a-upload>
              <p style="color: #999; font-size: 12px">
                注意：仅支持上传小于20M的png格式图片
              </p>
            </a-form-item>
            <a-form-item
              label="资质证书"
              name="qualificationCertificateFileId"
            >
              <p
                v-if="dataObj.qualificationCertificateFilePath"
                style="font-size: 12px"
              >
                <a href="javascript:;" @click="onCheckFile">
                  {{
                    dataObj.qualificationCertificateFileName || '查看上传文件'
                  }}
                </a>
                <a
                  href="javascript:;"
                  style="color: red; margin-left: 16px"
                  @click="onDelFile"
                >
                  删除
                </a>
              </p>
              <a-upload
                name="file"
                :multiple="false"
                :show-upload-list="false"
                accept=".pdf"
                :before-upload="beforeUploadFile"
              >
                <a-button

                  type="primary"
                  :loading="uploadFileLoading"
                >
                  {{
                    dataObj.qualificationCertificateFileId
                      ? '重新上传'
                      : '上传文件'
                  }}
                </a-button>
              </a-upload>
              <p style="color: #999; font-size: 12px">
                注意：仅支持上传小于50M的pdf格式文件
              </p>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { downloadFile, formatTime } from '~/providers/common/utils'
import { SealService } from '~/providers/providers/services/common-body-seal'
import { UploadControllerService } from '~/providers/providers/services/uploadController'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const sealService = new SealService()
const uploadControllerService = new UploadControllerService()

export default {
  props: ['value', 'editId', 'seal'],
  emits: ['update:value', 'on-save'],
  data() {
    return {
      spinning: false,
      dataObj: {},
      height: document.body.clientHeight,
      rules: {
        rangeDate: [
          { required: true, message: '请选择启用/截至日期', trigger: 'change' },
        ],
        sealStampFileId: [
          { required: true, message: '请上传印章图片', trigger: 'blur' },
        ],
      },
      uploadImgLoading: false,
      uploadFileLoading: false,
    }
  },
  computed: {
    _value() {
      return this.value
    },
    formItemProp() {
      return {
        'label-col': { span: 4 },
        'wrapper-col': { span: 18 },
      }
    },
    isAddPage() {
      return !this.editId
    },
    modalTitle() {
      const { isAddPage, seal } = this
      const title = []

      if (isAddPage) {
        title.push('新增印章版本')
      }
      else {
        title.push('编辑印章版本')
      }

      if (seal && seal.name) {
        title.push(`（${seal.name}）`)
      }

      return title.join('')
    },
  },
  watch: {
    value(val) {
      const { seal } = this

      if (val === true) {
        if (this.editId) {
          this.getDetail()
        }
        else {
          this.dataObj = {
            sealId: seal.id,
            startDate: null,
            endDate: null,
            rangeDate: [],
            sealStampFileId: null,
            sealStampFilePath: null,
            chapter: '',
            qualificationCertificateFileId: null,
            qualificationCertificateFilePath: null,
            qualificationCertificateFileName: null,
          }
        }
      }
    },
  },
  methods: {
    onCheckImg() {
      const imgUrl = this.dataObj.sealStampFilePath
      const wWidth = window.screen.width
      const hHeight = window.screen.height
      window.open(
        imgUrl,
        imgUrl,
        `height=380, width=380, top=${hHeight / 2 - 190}, left=${
          wWidth / 2 - 190
        }`,
      )
    },
    onCheckFile() {
      window.$oAjax({
        url: this.dataObj.qualificationCertificateFilePath,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        downloadFile(url, row.name)
      })
    },
    onDelFile() {
      this.dataObj.qualificationCertificateFileId = null
      this.dataObj.qualificationCertificateFilePath = null
      this.dataObj.qualificationCertificateFileName = null
    },
    beforeUploadImg(file) {
      const max = 20 * 1024 * 1024

      if (file.size > max || file.type !== 'image/png') {
        window.$oAntdModal.warning({
          title: '提示',
          content: '仅支持上传小于20M的png格式图片',
        })
        return
      }

      this.uploadImgLoading = true
      uploadControllerService
        .upload(file)
        .then((res) => {
          if (res.success && this.value) {
            const row = res.obj[0]
            this.dataObj.sealStampFileId = row.id
            this.dataObj.sealStampFilePath = row.realpath
            this.$refs.ruleForm.validateField('sealStampFileId')
            window.$oAntdMessage.success('上传成功')
          }
        })
        .finally(() => {
          this.uploadImgLoading = false
        })

      return false
    },
    beforeUploadFile(file) {
      const max = 50 * 1024 * 1024

      if (file.size > max || file.type !== 'application/pdf') {
        window.$oAntdModal.warning({
          title: '提示',
          content: '仅支持上传小于50M的pdf格式文件',
        })
        return
      }

      this.uploadFileLoading = true
      uploadControllerService
        .upload(file)
        .then((res) => {
          if (res.success && this.value) {
            const row = res.obj[0]
            this.dataObj.qualificationCertificateFileId = row.id
            this.dataObj.qualificationCertificateFilePath = row.realpath
            this.dataObj.qualificationCertificateFileName = row.attachmenttitle
            window.$oAntdMessage.success('上传成功')
          }
        })
        .finally(() => {
          this.uploadFileLoading = false
        })

      return false
    },
    onSealTypeChange() {
      this.dataObj.qualifications = []
    },
    onSignTypeChange() {
      if (this.dataObj.signType === 'notSign') {
        this.dataObj.formatType = '10'
        this.dataObj.autoSign = '0'
      }
    },
    async getDetail() {
      this.spinning = true
      const res = await sealService.getVersion(this.editId).finally(() => {
        this.spinning = false
      })

      if (res.code !== 20010) {
        const data = res.data
        delete data.horizontalLocation
        delete data.verticalLocation

        data.rangeDate = [data.startDate, data.endDate]

        this.dataObj = res.data
      }
    },
    cancelModal() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.$refs.ruleForm.resetFields()
      })
    },
    handleSubmit() {
      const { uploadImgLoading, uploadFileLoading } = this

      if (uploadImgLoading || uploadFileLoading) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '文件上传中，请稍等',
        })
        return
      }

      this.$refs.ruleForm.validateFields().then(async () => {
        this.spinning = true

        const formData = { ...this.dataObj }
        formData.startDate = formatTime(formData.rangeDate[0], 'YYYY-MM-DD')
        formData.endDate = formatTime(formData.rangeDate[1], 'YYYY-MM-DD')
        delete formData.rangeDate

        const fnName = this.isAddPage ? 'addVersion' : 'updateVersion'

        const res = await sealService[fnName](formData).finally(() => {
          this.spinning = false
        })

        if (res.code !== 20010) {
          this.cancelModal()
          $emit(this, 'on-save')
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.img-box {
  width: 148px;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px #e2e2e2;
  margin-bottom: 8px;
  img {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
