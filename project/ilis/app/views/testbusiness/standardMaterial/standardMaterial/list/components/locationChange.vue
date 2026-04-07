<template>
  <AppProvider>
    <div>
      <ht-modal
        :title="rangeId ? '编辑' : '位置变更'"
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
        <a-form :self-update="true">
          <p style="padding: 10px 40px; font-size: 12px">
            将把目标规程的存放位置统一设置为：
          </p>
          <a-form-item
            v-bind="formItemLayout"
            label="存放位置"
            class="required"
          >
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
              placeholder="请选择存放位置"
            />
          </a-form-item>
        </a-form>
      </ht-modal>
    </div>
  </AppProvider>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'

export default {
  name: 'AddEdit',
  props: ['typeId', 'rangeId', 'callback'],
  data() {
    return {
      selBoolList: [],
      selLocation: null,
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
    showModal(data) {
      this.selLocation = null
      this.visibleRules = true
      this.selBoolList = data
      this.getTreeData()
      // if (this.rangeId) {
      //   this.getData();
      // } else {
      //   this.editData = {};
      // }
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
      this.selLocation = null
    },
    handleOk() {
      // this.$refs.addeditchild.handleSubmit()
      if (!this.selLocation || !this.selLocation.value) {
        window.$oAntdMessage.warn('请选择存放位置')
        return
      }
      const data = {
        ids: this.selBoolList
          .map((it) => {
            return it.id
          })
          .join(','),
        locationId: this.selLocation.value,
      }
      this.confirmLoadingRules = true
      window.$oAjax({
        method: 'get',
        url: 'rest/standardBookStoreController?updateLocation',
        // headers: {
        //   "X-Requested-With": "XMLHttpRequest",
        //   "content-type": "application/json",
        // },
        params: data,
      }).then((res) => {
        if (res && res.code == '20000') {
          window.$oAntdMessage.success(res.msg || '操作成功')
          this.visibleRules = false
          this.selLocation = null
          this.editData = {}
          this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoadingRules = false
      })
    },
  },
}
</script>

<style scoped>
.required label::before {
  content: '*';
  color: red;
}
</style>
