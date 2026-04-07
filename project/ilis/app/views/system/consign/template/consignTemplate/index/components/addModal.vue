<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新增业务项目' : '编辑业务项目'"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-form ref="formRef" :model="data">
          <a-form-item
            label="工程项目"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            name="name"
            :rules="[{ required: true, message: '工程项目为必填项！' }]"
          >
            <a-input
              v-model:value="data.name"
              placeholder="请输入工程项目"
            />
          </a-form-item>
          <a-form-item
            label="项目编号"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            name="projectCode"
            :rules="[{ required: true, message: '项目编号为必填项！' }]"
          >
            <a-input
              v-model:value="data.projectCode"
              placeholder="请输入项目编号"
            />
          </a-form-item>
          <a-form-item
            label="所属部门"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            name="department"
            :rules="[{ required: true, message: '所属部门为必选项！' }]"
          >
            <a-tree-select
              v-model:value="data.department"
              multiple
              style="width: 100%"
              :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
              placeholder="请选择所属部门"
              allow-clear
              :tree-data="departmentData"
              tree-default-expand-all
              show-search
            />
          </a-form-item>
          <a-form-item
            label="施工单位"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="data.constructionUnitName"
              placeholder="请输入施工单位"
            />
          </a-form-item>

          <a-form-item
            label="建设单位"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="data.buildUnitName"
              placeholder="请输入建设单位"
            />
          </a-form-item>

          <a-form-item
            label="建设项目"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="data.buildProjectName"
              placeholder="请输入建设项目"
            />
          </a-form-item>
          <a-form-item
            label="见证单位"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="data.witnessUnitName"
              placeholder="请输入见证单位"
            />
          </a-form-item>
          <a-form-item
            label="所在省份"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="data.province"
              placeholder="请输入所在省份"
            />
          </a-form-item>
          <a-form-item
            label="项目简介"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-textarea
              v-model:value="data.description"
              placeholder="请输入项目简介"
              :rows="4"
            />
          </a-form-item>
          <a-form-item
            label="备注"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="data.remark"
              placeholder="请输入备注"
            />
          </a-form-item>
        </a-form>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'

let departmentObj = {}

export default {
  props: ['isAdd', 'callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',

      data: {},
      departmentData: [],
      projectCodeCache: '',
    }
  },
  created() {
    this.getLaboratoryData()
  },
  methods: {
    getLaboratoryData() {
      window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
        if (res && res.length > 0) {
          res.shift()
          departmentObj = {}
          this.departmentData = this.formatDepartmentData(res)
        }
      })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        departmentObj[item.id] = item.text
        arr.push({
          title: item.text,
          value: item.id,
          key: item.id,
          children,
        })
      })

      return arr
    },
    showModal(data) {
      this.visible = true
      if (data) {
        this.data = data
        this.projectCodeCache = data.projectCode
        this.data.department = data.departIds.split(',')
      }
      else {
        this.data = {
          name: '',
          projectCode: '',
          constructionUnitName: '',
          buildUnitName: '',
          buildProjectName: '',
          witnessUnitName: '',
          province: '',
          description: '',
          remark: '',
        }
      }
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(async () => {
        let url = window.$oApi.testItem.addProject
        let data = { ...this.data }

        data.departIds = data.department.toString()
        data.departNames = []
        for (let i = 0; i < data.department.length; i++) {
          data.departNames.push(departmentObj[data.department[i]])
        }
        data.departNames = data.departNames.toString()
        delete data.department

        if (data.name === '') {
          window.$oAntdModal.warning(window.$oMsgTips.info('工程项目为必填项'))
          return
        }

        if (data.projectCode === '') {
          window.$oAntdModal.warning(window.$oMsgTips.info('项目编号为必填项'))
          return
        }

        if (data.description && data.description.length > 300) {
          window.$oAntdModal.warning(window.$oMsgTips.info('项目简介最多输入300个字符'))
          return
        }
        this.confirmLoading = true

        if (this.isAdd === false) {
          url = window.$oApi.testItem.updateProject
          data = {
            ...data,
            id: this.data.id,
          }
        }

        const hasSameCode = await this.projectCodeDetect(data.projectCode)
        if (hasSameCode) {
          // eslint-disable-next-line ts/no-this-alias
          const _this = this
          window.$oAntdConfirm({
            title: '继续操作确认',
            content: `检测到已有项目正在使用编号：[${data.projectCode}]，是否继续提交？`,
            onOk() {
              _this.submit(url, data)
            },
            onCancel() {
              _this.confirmLoading = false
            },
          })
        }
        else {
          this.submit(url, data)
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.data = {}
      this.projectCodeCache = ''
    },
    async projectCodeDetect(code) {
      if (this.projectCodeCache === code) {
        return false
      }
      const url = window.$oApi.testItem.sameProjectCodeDetect
      const res = await window.$oAjax({
        method: 'POST',
        url,
        params: { projectCode: code },
      })
      return res.data
    },
    submit(url, data) {
      window.$oAjax({
        method: 'POST',
        url,
        data: qs.stringify({ ...data, isSynthesisProject: 'synthesis' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          window.$oAntdMessage.success(res.msg)
          this.handleCancel()
          this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
  },
}
</script>

<style></style>
