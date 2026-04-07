<template>
  <AppProvider>
    <div>
      <ht-modal
        :title="rangeId ? '编辑' : '规程归还'"
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
            label="归还人"
            :rules="[{ required: true, message: '请输入归还人' }]"
            name="returnPerson"
          >
            <a-input
              v-model:value="editData.returnPerson"
              placeholder="请输入归还人"
            />
          </a-form-item>

          <a-form-item
            v-bind="formItemLayout"
            label="归还数量"
            :rules="[{ required: true, message: '请输入归还数量' }]"
            name="returnAmount"
          >
            <a-input-number
              v-model:value="editData.returnAmount"
              placeholder="请输入归数量"
              style="width: 100%"
              :min="0"
            />
          </a-form-item>

          <a-form-item v-bind="formItemLayout" label="备注信息">
            <a-input
              v-model:value="editData.remark"
              placeholder="请输入备注信息"
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
      bookStoreIdArr: {},
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
        const data = {
          ...fieldsValue,
          bookStoreId: this.bookStoreIdArr.id,
        }
        this.confirmLoadingRules = true
        window.$oAjax({
          method: 'POST',
          url: 'rest/standardBookStoreReturnController?add',
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
