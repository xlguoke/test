<template>
  <AppProvider>
    <div>
      <ht-modal
        :title="editId ? '编辑' : '入库登记'"
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
            label="规程名称"
            :rules="[{ required: true, message: '请输入规程名称' }]"
            name="bookName"
          >
            <a-input
              v-model:value="editData.bookName"
              placeholder="请输入规程名称"
            />
          </a-form-item>
          <a-form-item
            v-bind="formItemLayout"
            label="颁布号"
            :rules="[{ required: true, message: '请输入颁布号' }]"
            name="publishCode"
          >
            <a-input
              v-model:value="editData.publishCode"
              placeholder="请输入颁布号"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="执行时间">
            <a-date-picker
              v-model:value="editData.executeDate"
              placeholder="请选择执行时间"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            ></a-date-picker>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="过期时间">
            <a-date-picker
              v-model:value="editData.expireDate"
              placeholder="请选择过期时间"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            ></a-date-picker>
          </a-form-item>
          <a-form-item
            v-bind="formItemLayout"
            label="入库数量"
            :rules="[{ required: true, message: '请输入入库数量' }]"
            name="inAmount"
          >
            <a-input-number
              v-model:value="editData.inAmount"
              placeholder="请输入入库数量"
              style="width: 100%"
              :min="0"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="存放位置">
            <a-tree-select
              v-model:value="selLocation"
              :label-in-value="true"
              tree-data-simple-mode
              :field-names="{
                children: 'children',
                label: 'location',
                value: 'id',
              }"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              placeholder="请选择父级位置"
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
      editId: '',
      selLocation: {},
      treeData: [],
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
    showModal(treeId, echo) {
      this.getTreeData()
      this.visibleRules = true
      this.selLocation = { value: treeId }
      if (echo) {
        this.editData = echo[0]
        this.editId = echo[0].id
        this.selLocation = { value: echo[0].bookLocationId }
      }
      else {
        this.editData = {}
        this.editId = ''
      }
    },
    // getData() {
    //   // var self = this;
    //   var data = {
    //     id: this.rangeId,
    //   };
    //   window.$oAjax
    //     .get(window.$oApi.designGrade.rangeDetailUrl, {
    //       params: {
    //         ...data,
    //       },
    //     })
    //     .then((res) => {
    //       if (res.success) {
    //         this.editData = res.obj || {};
    //         this.typeId = res.obj.typeId;
    //       }
    //     });
    // },
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
          id: this.editId,
          bookLocationId: this.selLocation.value,
        }

        this.confirmLoadingRules = true
        window.$oAjax({
          method: 'POST',
          url: 'rest/standardBookStoreController?addOrEdit',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: JSON.stringify(data),
        }).then((res) => {
          if (res && res.code == '20000') {
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
