<template>
  <div>
    <ht-modal
      v-if="uploadVisible"
      v-model:open="uploadVisible"
      :title="isAdd ? '新增' : `${isDisabled ? '详情' : '编辑'}`"
      centered
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      width="1000px"
      class="otherAchievement-uploadModal"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="data">
        <p style="padding: 10px; font-weight: 900; font-size: 15px">
          样品信息：
        </p>
        <a-row>
          <a-col span="8">
            <a-form-item
              label="样品名称"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              :rules="[{ required: true, message: '请输入样品名称' }]"
              name="testSampleDisplayName"
            >
              <a-input
                v-model:value="data.testSampleDisplayName"
                :disabled="isDisabled"
                placeholder="请输入样品名称"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="规格型号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              :rules="[{ required: true, message: '请输入规格型号' }]"
              name="standard"
            >
              <a-input
                v-model:value="data.standard"
                :disabled="isDisabled"
                placeholder="请输入规格型号"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="样品编号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              :rules="mustSamplesCode === 'Y'
                ? [{ required: true, message: '请输入样品编号' }]
                : []"
              name="testObjectCode"
            >
              <a-input
                v-model:value="data.testObjectCode"
                :disabled="isDisabled"
                placeholder="请输入样品编号"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col span="8">
            <a-form-item
              label="试样数量"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.quantity"
                :disabled="isDisabled"
                placeholder="请输入试样数量"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="代表数量"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.representNum"
                :disabled="isDisabled"
                placeholder="请输入代表数量"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="生产厂家"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.manufacturer"
                :disabled="isDisabled"
                placeholder="请输入生产厂家"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col span="8">
            <a-form-item
              label="生产产地"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.manufactureLocation"
                :disabled="isDisabled"
                placeholder="请输入生产产地"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="生产日期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-date-picker
                v-model:value="data.manufactureDate"
                :disabled="isDisabled"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="出厂日期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-date-picker
                v-model:value="data.ccrq"
                :disabled="isDisabled"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col span="8">
            <a-form-item
              label="批号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.batchNumber"
                :disabled="isDisabled"
                placeholder="请输入批号"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="委托编号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.externalConsignCode"
                :disabled="isDisabled"
                placeholder="请输入委托编号"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="报告编号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.reportCodes"
                :disabled="isDisabled"
                placeholder="请输入报告编号"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col span="8">
            <a-form-item
              label="取样地点"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.samplingPlace"
                :disabled="isDisabled"
                placeholder="请输入取样地点"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="样品描述"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-model:value="data.description"
                :disabled="isDisabled"
                placeholder="请输入样品描述"
              />
            </a-form-item>
          </a-col>

          <a-col span="8">
            <a-form-item
              v-if="comeSampleNumber == 'Y'"
              label="来样编号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              :rules="comeSampleNumber == 'Y' && mustSamplesCode == 'Y'
                ? [{ required: true, message: '请输入来样编号' }]
                : []"
              name="testObjectCode"
            >
              <a-input
                v-model:value="data.provideToCustomerSampleCode"
                :disabled="isDisabled"
                placeholder="请输入来样编号"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import UploadComponent from '~/providers/components/uploadComponent.vue'

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    UploadComponent,
  },
  props: ['callback', 'id'],
  data() {
    return {
      isDisabled: false,
      uploadVisible: false,
      confirmLoading: false,

      fileLists: [],
      isAdd: true,
      data: {},
      dayjs,
      comeSampleNumber: 'N', // 启用来样编号
      mustSamplesCode: 'N', // 启用编号占用
    }
  },
  async created() {
    const res = await window.$oAjax.get(
      `tSBusinessParamController.do?getBusinessParam&key=ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE`,
    )
    this.comeSampleNumber = res.obj

    const res2 = await window.$oAjax.get(
      `tSBusinessParamController.do?getBusinessParam&key=EXTERNAL_OBJECT_OCCUPATION`,
    )
    this.mustSamplesCode = res2.obj
  },
  methods: {
    async verifyCode(code, id) {
      const res = await window.$oAjax.get(
        `rest/object/external/sn/?sn=${code}&id=${id}`,
      )
      if (res.code === 20000) {
        return Promise.resolve(true)
      }
      else {
        message.error(res.message || res.msg)
        this.confirmLoading = false
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(false)
      }
    },
    showModal(data) {
      if (data) {
        this.isAdd = false
        this.data = data
      }
      else {
        this.data = {}
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
      if (this.isDisabled) {
        this.cancelModal()
        return
      }

      this.$refs.formRef.validateFields().then(async () => {
        this.confirmLoading = true
        const values = { ...this.data }
        if (values.manufactureDate) {
          values.manufactureDate = dayjs(
            values.manufactureDate,
          ).format('YYYY-MM-DD')
        }
        if (values.ccrq) {
          values.ccrq = dayjs(values.ccrq).format('YYYY-MM-DD')
        }
        const data = {
          ...values,
          type: 3,
        }
        if (this.mustSamplesCode == 'Y') {
          const res = await window.$oAjax.get(
            `testObjectController/validObjectCode.do?code=${values.testObjectCode}&id=${this.data.id}`,
          )
          if (res.code !== 20000) {
            message.error(res.message || res.msg)
            this.confirmLoading = false
            return
          }
        }
        const via = await this.verifyCode(
          values.testObjectCode,
          this.data.id,
        )
        if (!via) {
          return
        }
        if (!this.isAdd) {
          data.id = this.data.id
        }
        window.$oAjax({
          method: this.isAdd ? 'POST' : 'PUT',
          url: `/rest/object/external`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.code == '21000') {
              this.cancelModal()
              message.success('添加成功')
              this.callback()
            }
            else if (res && res.code == '22000') {
              this.cancelModal()
              message.success('修改成功')
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
        uid: item.id,
        name: item.attachmenttitle,
        status: 'done',
        url: item.realpath,
      }))
    },
  },
}
</script>
