<template>
  <a-form ref="formRef" :model="editData">
    <a-form-item
      v-bind="formItemLayout"
      label="检测类型名称"
      :rules="[{ required: true, message: '请输入检测类型名称' }]"
      name="name"
    >
      <a-input
        v-model:value="editData.name"
        :disabled="isDetail"
        placeholder="请输入检测类型名称"
      />
    </a-form-item>
    <a-form-item
      v-bind="formItemLayout"
      label="检验类别全称"
      :rules="[{ required: true, message: '请输入检验类别全称' }]"
      name="fullName"
    >
      <a-input
        v-model:value="editData.fullName"
        :disabled="isDetail"
        placeholder="请输入检验类别全称"
      />
    </a-form-item>
    <a-form-item
      v-bind="formItemLayout"
      label="标准类别名称"
      name="standardTypeCode"
    >
      <a-select
        v-model:value="editData.standardTypeCode"
        placeholder="选择标准类别名称"
      >
        <a-select-option
          v-for="item in dictionaryList"
          :key="item.id"
          :value="item.typecode"
        >
          {{ item.typename }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="掩码" name="code">
      <a-input
        v-model:value="editData.code"
        :disabled="isDetail"
        placeholder="请输入掩码"
      />
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="是否收费" name="isCharge">
      <a-radio-group
        v-model:value="editData.isCharge"
        style="width: 100%"
      >
        <a-radio value="1">
          是
        </a-radio>
        <a-radio value="0">
          否
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="是否默认类型" name="isDefault">
      <a-radio-group v-model:value="editData.isDefault">
        <a-radio value="1">
          是
        </a-radio>
        <a-radio value="0">
          否
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="适用范围" name="scopeOfApp">
      <a-radio-group v-model:value="editData.scopeOfApp">
        <a-radio value="1">
          现场检测
        </a-radio>
        <a-radio value="2">
          非现场检测
        </a-radio>
        <a-radio value="3">
          全部
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="应用到预委托" name="preVisible" :rules="[{ required: true, message: '请选择是否应用到预委托' }]">
      <a-radio-group v-model:value="editData.preVisible">
        <a-radio :value="true">
          是
        </a-radio>
        <a-radio :value="false">
          否
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="备注" name="remark">
      <a-textarea
        v-model:value="editData.remark"
        :disabled="isDetail"
        placeholder="请输入备注"
      />
    </a-form-item>
  </a-form>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'AddEdit',
  components: {},
  props: ['callback'],
  data() {
    return {
      categoryId: '',
      dictionaryList: [],
      isDetail: false,
      formItemLayout: {
        labelCol: {
          xs: { span: 6 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 18 },
          sm: { span: 18 },
        },
      },
      editData: {
        isCharge: '0',
        isDefault: '0',
        scopeOfApp: '3',
        preVisible: true,
      },
      editId: '',
      visible: false,
    }
  },
  created() {
    this.getSelectDataByDictionary()
  },
  methods: {
    dayjs,
    showModal(categoryId, record, isDetail) {
      this.isDetail = isDetail
      this.categoryId = categoryId
      if (record) {
        const row = { ...record }
        this.editId = row.id
        this.editData = row || { isCharge: '0', isDefault: '0', scopeOfApp: '3' }
        // 旧数据由于没有这个字段，编辑时默认为是
        if (this.editData.preVisible === null) {
          this.editData.preVisible = true
        }
      }
      else {
        this.editData = { isCharge: '0', isDefault: '0', scopeOfApp: '3', preVisible: true }
        this.editId = ''
      }
    },
    resetForm() {
      this.$refs.formRef.resetFields()
    },
    getSelectDataByDictionary() {
      window.$oAjax
        .get(
          '/dictionaryController.do?getListByGroupId&dictGroupId=a858a7d3b72649dc843ffa6c4b888AAA',
        )
        .then((res) => {
          if (res.success) {
            this.dictionaryList = res.obj
          }
        })
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.editData }
        const data = {
          ...fieldsValue,
          categoryId: this.categoryId,
        }
        this.dictionaryList.forEach((item) => {
          if (item.typecode === data.standardTypeCode) {
            data.standardType = item.typename
          }
        })
        let url = window.$oApi.testCategory.doAddInspects
        if (this.editId) {
          data.id = this.editId
          url = window.$oApi.testCategory.doUpdateInspects
        }
        else {
          data.categoryId = this.categoryId
        }
        window.$oAjax({
          method: 'POST',
          data: window.$oQs.stringify(data),
          url,
        }).then((res) => {
          if (res.success) {
            this.editData = {}
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
      })
    },
  },
}
</script>

<style scoped></style>
