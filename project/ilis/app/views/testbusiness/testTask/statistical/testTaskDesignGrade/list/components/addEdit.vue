<template>
  <AppProvider>
    <div>
      <ht-modal
        :title="rangeId ? '编辑级配范围' : '新增级配范围'"
        :open="visibleRules"
        :confirm-loading="confirmLoadingRules"
        :mask-closable="maskClosable"
        @ok="handleOk"
        @cancel="
          () => {
            handleCancel()
          }
        "
      >
        <a-form ref="formRef" :self-update="true" :model="editData">
          <a-form-item v-bind="formItemLayout" label="筛孔尺寸" name="screenSize" :rules="[{ required: true, message: '请输入筛孔尺寸' }]">
            <a-input
              v-model:value="editData.screenSize"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="上限">
            <a-input
              v-model:value="editData.upperLimit"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="下限">
            <a-input
              v-model:value="editData.lowerLimit"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="标准">
            <a-input
              v-model:value="editData.standard"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="限制区界限最小">
            <a-input
              v-model:value="editData.minLimitZone"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="限制区界限最大">
            <a-input
              v-model:value="editData.maxLimitZone"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="控制点界限最小">
            <a-input
              v-model:value="editData.minControlPoint"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="控制点界限最大">
            <a-input
              v-model:value="editData.maxControlPoint"
            />
          </a-form-item>

          <a-form-item v-bind="formItemLayout" label="顺序号">
            <a-input
              v-model:value="editData.orderNum"
              type="number"
              min="0"
              @change="(e) => numberChange(e.target.value, 'orderNum')"
            />
          </a-form-item>
        </a-form>
      </ht-modal>
    </div>
  </AppProvider>
</template>

<script>
export default {
  name: 'AddEdit',
  props: ['typeId', 'rangeId', 'callback'],
  data() {
    return {
      formItemLayout: {
        labelCol: {
          xs: { span: 5 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 18 },
          sm: { span: 18 },
        },
      },
      editData: {},
      visibleRules: false,
      confirmLoadingRules: false,
      maskClosable: false,

    }
  },
  computed: {
    _typeId() {
      return this.typeId
    },
  },
  watch: {
    rangeId() {
      //
    },
  },
  methods: {
    isNumber(value) {
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const reg = /^\d+(?=\.?\d+$|$)/
      if (value && !reg.test(value)) {
        return false
      }
      return true
    },
    numberChange(value, column) {
      if (!this.isNumber(value)) {
        setTimeout(() => {
          this.editData[column] = ''
        }, 0)
      }
    },
    showModal() {
      this.visibleRules = true
      if (this.rangeId) {
        this.getData()
      }
      else {
        this.editData = {}
      }
    },
    getData() {
      // var self = this;
      const data = {
        id: this.rangeId,
      }
      window.$oAjax
        .get(window.$oApi.designGrade.rangeDetailUrl, {
          params: {
            ...data,
          },
        })
        .then((res) => {
          if (res.success) {
            this.editData = res.obj || {}
            this._typeId = res.obj.typeId
          }
        })
    },
    handleCancel() {
      this.visibleRules = false
      this.editData = {}
    },
    handleOk() {
      // this.$refs.addeditchild.handleSubmit()
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.editData }
        const data = {
          ...fieldsValue,
        }
        if (this.rangeId) {
          data.typeId = this.typeId
          data.id = this.rangeId
        }
        else {
          data.typeId = this.typeId
        }
        this.confirmLoadingRules = true
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.designGrade.rangeAddUpdateUrl,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: JSON.stringify(data),
        }).then((res) => {
          if (res && res.success) {
            window.$oAntdMessage.success(res.msg)
            this.visibleRules = false
            this.editData = {}
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.confirmLoadingRules = false
        })
      })
    },
  },
}
</script>

<style scoped></style>
