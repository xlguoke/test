<template>
  <AppProvider>
    <div>
      <ht-modal
        :title="isEdit ? '编辑存放位置' : '新增存放位置'"
        :mask-closable="maskClosable"
        :open="visible"
        :confirm-loading="confirmLoading"
        cancel-text="取消"
        ok-text="确定"
        @ok="addLocationOk"
        @cancel="handleCancel"
      >
        <a-form-item
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 15 }"
          label="父级位置："
          class="required"
        >
          <!-- <a-input placeholder="请选择父级位置" v-model="typeName" /> -->
          <a-tree-select
            v-model:value="selParentLocation"
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
        <a-form-item
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 15 }"
          label="位置名称："
          class="required"
        >
          <a-input
            v-model:value="locationForm.location"
            placeholder="请输入位置名称"
          />
        </a-form-item>
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
      visible: false,
      isEdit: true,
      locationForm: {
        pid: '',
        location: '',
      },
      selBoolList: [],
      selParentLocation: {},
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
      confirmLoading: false,
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

          this.treeData = [
            {
              location: '/',
              id: '',
              pid: '',
              children: res.data,
            },
          ]
          // #35562 需要让创建人才允许编辑
          // this.isDisabledEditManage();
        }
      })
    },
    showModal(data, isAdd) {
      this.getTreeData()
      this.visible = true

      isAdd ? (this.isEdit = false) : (this.isEdit = true)
      if (!isAdd) {
        this.locationForm = data
        this.selParentLocation.value = data.pid
      }
      else {
        this.locationForm = {
          pid: '',
          location: '',
        }
        this.selParentLocation.value = data.id || ''
      }

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
      this.visible = false
      this.locationForm = {
        pid: '',
        location: '',
      }
      this.selParentLocation = {}
    },
    addLocationOk() {
      if (!this.selParentLocation) {
        window.$oAntdMessage.warn('请选择父级位置')
        return
      }
      else if (!this.locationForm.location) {
        window.$oAntdMessage.warn('请输入位置名称')
        return
      }

      this.confirmLoading = true
      this.locationForm.pid = this.selParentLocation.value
      window.$oAjax({
        method: 'POST',
        url: 'rest/standardBookLocationController?addOrEdit',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: this.locationForm,
      }).then((res) => {
        this.confirmLoading = false
        if (res && res.code == '20000') {
          window.$oAntdMessage.success(res.msg || '操作成功')
          this.visible = false
          this.locationForm = {
            pid: '',
            location: '',
          }
          this.selParentLocation = {}
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
