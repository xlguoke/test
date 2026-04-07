<template>
  <AppProvider>
    <div>
      <ht-modal
        :title="rangeId ? '编辑' : '出库登记'"
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
          <a-form-item
            v-bind="formItemLayout"
            label="出库类型"
            :rules="[{ required: true, message: '请选择出库类型！' }]"
            name="outType"
          >
            <a-select
              v-model:value="editData.outType"
              placeholder="请选择出库类型"
            >
              <a-select-option value="借阅">
                借阅
              </a-select-option>
              <a-select-option value="领用">
                领用
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-bind="formItemLayout"
            label="使用人"
            :rules="[{ required: true, message: '请输入使用人' }]"
            name="usePerson"
          >
            <a-input
              v-model:value="editData.usePerson"
              placeholder="请输入使用人"
            />
          </a-form-item>

          <a-form-item
            v-bind="formItemLayout"
            label="出库数量"
            :rules="[{ required: true, message: '请输入出库数量' }]"
            name="outAmount"
          >
            <a-input-number
              v-model:value="editData.outAmount"
              placeholder="请输入出库数量"
              style="width: 100%"
              :min="0"
            />
          </a-form-item>

          <a-form-item v-bind="formItemLayout" label="备注信息">
            <a-input
              v-model:value="editData.remark"
              placeholder="备注信息"
            />
          </a-form-item>
        </a-form>
      </ht-modal>
    </div>
  </AppProvider>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'AddEdit',
  props: ['typeId', 'rangeId', 'callback'],
  data() {
    return {
      selLocation: {},
      treeData: [],
      bookStoreIdArr: [],
      dayjs,
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
  watch: {
    rangeId() {
      //
    },
  },
  created() {
  },
  methods: {
    getTreeData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const data = {
        // page: 1,
        // size: 9999,
        // queryParam: this.queryParam,
      }
      this.treeData = []
      window.$oAjax.get('rest/standardBookLocationController?list').then((res) => {
        if (res.code == '20000') {
          this.selectedKeys = []
          // this.getTreeDataCall(res.obj);

          this.treeData = res.data
          // #35562 需要让创建人才允许编辑
          // this.isDisabledEditManage();
        }
      })
    },

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
    showModal(data) {
      this.visibleRules = true
      this.bookStoreIdArr = data
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
            // eslint-disable-next-line vue/no-mutating-props
            this.typeId = res.obj.typeId
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
        const bookStoreIds = this.bookStoreIdArr.map((it) => {
          return it.id
        })

        const data = {
          ...fieldsValue,
          bookStoreIds,
          usePersonId: '1',
        }
        this.confirmLoadingRules = true
        window.$oAjax({
          method: 'POST',
          url: 'rest/standardBookStoreOutController?batchAdd',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: JSON.stringify(data),
        }).then((res) => {
          if (res && res.code === 20000) {
            window.$oAntdMessage.success(res.msg || '操作成功')
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
