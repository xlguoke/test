<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      :title="isAdd ? '新增' : '编辑'"
      centered
      :confirm-loading="confirmLoading"
      class="otherAchievement-uploadModal"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="证书类型"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-radio-group
            v-model:value="data.certificateCategory"
            :disabled="!isAdd"
            @change="onChangeCategory"
          >
            <a-radio value="试验检测证书">
              试验检测证书
            </a-radio>
            <a-radio value="其他">
              其他
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="证书编号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入证书编号！' }]"
          name="certificateNumber"
        >
          <a-input
            v-model:value="data.certificateNumber"
            placeholder="请输入证书编号"
          />
        </a-form-item>

        <template v-if="data.certificateCategory === '试验检测证书'">
          <a-form-item
            label="持证类型"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            :rules="[{ required: true, message: '请选择持证类型！' }]"
            name="certificateType"
          >
            <a-select
              v-model:value="data.certificateType"
              placeholder="请选择持证类型"
            >
              <a-select-option
                v-for="(item, index) in typeData"
                :key="index"
                :value="item.typecode"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="持证专业"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            name="certificateProfessional"
          >
            <a-select
              v-model:value="data.certificateProfessional"
              mode="multiple"
              placeholder="请选择持证专业"
            >
              <a-select-option
                v-for="(item, index) in professionData"
                :key="index"
                :value="item.typecode"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item
            label="发证单位"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            name="issueUnit"
          >
            <a-input
              v-model:value="data.issueUnit"
              placeholder="请输入发证单位"
            />
          </a-form-item>
          <a-form-item
            label="专业范围"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            :rules="[{ required: true, message: '请输入专业范围！' }]"
            name="scopeExpertise"
          >
            <a-input
              v-model:value="data.scopeExpertise"
              placeholder="请输入专业范围"
            />
          </a-form-item>
          <a-form-item
            label="证书等级"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            name="certificateGrade"
          >
            <a-input
              v-model:value="data.certificateGrade"
              placeholder="请输入证书等级"
            />
          </a-form-item>
          <a-form-item
            label="初领日期"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            name="firstCollectionDate"
          >
            <a-date-picker
              v-model:value="data.firstCollectionDate"
              placeholder="请选择初领日期"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="有效期"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            name="expirationDate"
          >
            <a-date-picker
              v-model:value="data.expirationDate"
              placeholder="请选择有效期"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="复审日期"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
            name="reviewDate"
          >
            <a-date-picker
              v-model:value="data.reviewDate"
              value-format="YYYY-MM-DD"
              placeholder="请选择复审日期"
            />
          </a-form-item>
        </template>
        <a-form-item
          label="证书文件"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-button @click="upload">
            上传文件
          </a-button>
          <div
            v-for="(item, index) in fileLists"
            :key="index"
            style="font-size: 12px"
          >
            {{ item.name }}
          </div>
        </a-form-item>
        <a-form-item
          v-if="data.certificateCategory === '试验检测证书'"
          label="证书有效期"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          name="firstCollectionDate"
          :rules="[{ required: true, message: '请选择证书有效期！' }]"
        >
          <a-space>
            <a-date-picker
              v-model:value="data.firstCollectionDate"
              placeholder="请选择生效日期"
              value-format="YYYY-MM-DD"
              @change="onChangeCollectionDate"
            />
            <span>~</span>
            <a-date-picker
              v-model:value="data.expirationDate"
              placeholder="请选择失效日期"
              value-format="YYYY-MM-DD"
              disabled
            />
          </a-space>
        </a-form-item>
      </a-form>
    </ht-modal>
    <UploadComponent
      ref="UploadComponent"
      :max="5"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import UploadComponent from '~/providers/components/uploadComponent.vue'

export default {
  components: {
    UploadComponent,
  },
  props: ['callback', 'id'],
  data() {
    return {
      certificateType: 'test',
      uploadVisible: false,
      confirmLoading: false,

      fileLists: [],
      isAdd: true,
      professionData: [],
      typeData: [],
      data: {
        certificateCategory: '试验检测证书',
      },
    }
  },
  created() {
    this.getSelectData()
  },
  methods: {
    onChangeCategory() {
      if (this.data.certificateCategory === '试验检测证书') {
        this.data.firstCollectionDate = undefined
        this.data.expirationDate = undefined
      }
    },
    onChangeCollectionDate() {
      if (this.data.firstCollectionDate) {
        this.data.expirationDate = dayjs(this.data.firstCollectionDate).add(2, 'year').subtract(1, 'day').format('YYYY-MM-DD')
      }
      else {
        this.data.expirationDate = null
      }
    },
    getSelectData() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '4028821e6eb14554016eb1e11006000c' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.professionData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '4028821e6eb14554016eb1dfd7d80006' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.typeData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })
    },
    showModal(data) {
      if (data) {
        this.isAdd = false
        this.data = { ...data }
        if (this.data.certificateProfessional) {
          this.data.certificateProfessional
            = this.data.certificateProfessional.split(',')
        }

        if (data.firstCollectionDate) {
          this.data.firstCollectionDate = dayjs(
            data.firstCollectionDate,
          ).format('YYYY-MM-DD')
        }
        if (data.expirationDate) {
          this.data.expirationDate = dayjs(data.expirationDate).format(
            'YYYY-MM-DD',
          )
        }
        if (data.reviewDate) {
          this.data.reviewDate = dayjs(data.reviewDate).format('YYYY-MM-DD')
        }

        if (!data.certificateCategory) {
          this.data.certificateCategory = '试验检测证书'
        }

        this.fileLists = data.certificateAttach.map(item => ({
          uid: item.attachmentId,
          name: item.name,
          status: 'done',
          url: item.url,
        }))
      }
      else {
        this.data = {
          certificateCategory: '试验检测证书',
        }
        this.isAdd = true
        this.fileLists = []
      }
      this.uploadVisible = true
    },
    cancelModal() {
      this.data = {}
      this.uploadVisible = false
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.data }

        this.confirmLoading = true
        const data = {
          certificateCategory: this.data.certificateCategory,
          ...values,
          certificateProfessional: values.certificateProfessional
            ? values.certificateProfessional.toString()
            : undefined,
          biddingPersonId: this.id,
        }

        data.certificateAttach = this.fileLists.map(item => ({
          attachmentId: item.uid,
          name: item.name,
          url: item.url,
        }))

        if (data.certificateCategory === '试验检测证书') {
          data.issueUnit = undefined
          data.scopeExpertise = undefined
          data.certificateGrade = undefined
          data.reviewDate = undefined
        }
        else {
          data.certificateType = undefined
          data.certificateProfessional = undefined
        }

        if (!this.isAdd) {
          data.id = this.data.id
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingPerson.certificate}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.success) {
              this.cancelModal()
              message.success(res.message || res.msg)
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
          () => {
            this.confirmLoading = false
          },
        )
      })
    },
    upload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
    },
  },
}
</script>

<style></style>
