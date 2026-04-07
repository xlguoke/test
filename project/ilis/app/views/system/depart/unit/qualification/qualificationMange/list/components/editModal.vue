<template>
  <div>
    <ht-modal
      v-model:open="_value"
      :title="modalTitle"
      :confirm-loading="spinning"
      :mask-closable="false"
      width="460px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form
            ref="formRef"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :model="dataObj"
          >
            <a-form-item
              label="资质名称"
              :rules="[{ required: true, message: '资质名称为必填项！' }]"
              name="name"
            >
              <a-input
                v-model:value="dataObj.name"
                :max-length="20"
                placeholder="请输入资质名称"
              />
            </a-form-item>
            <a-form-item
              label="资质掩码"
              :rules="[{ required: true, message: '资质掩码为必填项！' }]"
              name="code"
            >
              <a-input
                v-model:value="dataObj.code"
                :max-length="20"
                placeholder="请输入资质掩码"
              />
            </a-form-item>
            <a-form-item
              label="证书编号"
              :rules="[{ required: true, message: '证书编号为必填项！' }]"
              name="certificateNo"
            >
              <a-input
                v-model:value="dataObj.certificateNo"
                :max-length="20"
                placeholder="请输入证书编号"
              />
            </a-form-item>
            <a-form-item label="是否默认资质">
              <a-radio-group
                v-model:value="dataObj.defaultFlag"
                name="defaultFlag"
              >
                <a-radio :value="true">
                  是
                </a-radio>
                <a-radio :value="false">
                  否
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="自动添加该资质">
              <a-radio-group
                v-model:value="dataObj.auto"
                name="auto"
              >
                <a-radio :value="true">
                  是
                </a-radio>
                <a-radio :value="false">
                  否
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="资质生效日期">
              <a-date-picker
                v-model:value="dataObj.statementEnableDate"
                value-format="YYYY-MM-DD"
                name="statementEnableDate"
                @change="(val) => checkStatementDate('statementEnableDate', val)"
              />
            </a-form-item>
            <a-form-item label="资质失效日期">
              <a-date-picker
                v-model:value="dataObj.statementExpiredDate"
                value-format="YYYY-MM-DD"
                name="statementExpiredDate"
                @change="(val) => checkStatementDate('statementExpiredDate', val)"
              />
            </a-form-item>
            <a-form-item label="备注">
              <a-input
                v-model:value="dataObj.remark"
                placeholder="请输入"
                :max-length="20"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const qualificationService = new QualificationService()

export default {
  props: ['value', 'editId'],
  emits: ['update:value', 'on-save'],
  data() {
    return {

      spinning: false,
      dataObj: {},
      height: document.body.clientHeight,
    }
  },
  computed: {
    isAddPage() {
      return !this.editId
    },
    modalTitle() {
      return this.isAddPage ? '新增资质' : '编辑资质'
    },
    _value() {
      return this.value
    },
  },
  watch: {
    value(val) {
      if (val === true) {
        this.init()
      }
    },
  },
  created() {},
  methods: {
    init() {
      if (this.editId) {
        this.getDetail()
      }
      else {
        this.dataObj = {
          name: '',
          code: '',
          defaultFlag: false,
          auto: false,
          remark: '',
        }
      }
    },
    cancelModal() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.dataObj = {}
      })
    },
    async getDetail() {
      this.spinning = true
      const res = await qualificationService
        .getQualification(this.editId)
        .finally(() => {
          this.spinning = false
        })
      if (res.code !== 20010) {
        this.dataObj = res.data
      }
    },
    checkStatementDate(key, val) {
      const statementEnableDate = this.dataObj.statementEnableDate
      const statementExpiredDate = this.dataObj.statementExpiredDate

      if (val && key === 'statementEnableDate' && statementExpiredDate) {
        if (new Date(val).getTime() > new Date(statementExpiredDate).getTime()) {
          window.$oAntdModal.warning({
            title: '提示',
            content: '资质生效日期不能大于资质失效日期！',
          })
          setTimeout(() => {
            this.dataObj.statementEnableDate = null
          }, 100)
        }
      }

      if (val && key === 'statementExpiredDate' && statementEnableDate) {
        if (new Date(val).getTime() < new Date(statementEnableDate).getTime()) {
          window.$oAntdModal.warning({
            title: '提示',
            content: '资质失效日期不能小于资质生效日期！',
          })
          setTimeout(() => {
            this.dataObj.statementExpiredDate = null
          }, 100)
        }
      }
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(async () => {
        const formData = { ...this.dataObj }

        this.spinning = true

        const fnName = this.isAddPage ? 'add' : 'update'
        const res = await qualificationService[fnName](formData).finally(
          () => {
            this.spinning = false
          },
        )

        if (res.code !== 20010) {
          this.cancelModal()
          $emit(this, 'on-save')
        }
      })
    },
  },
}
</script>
