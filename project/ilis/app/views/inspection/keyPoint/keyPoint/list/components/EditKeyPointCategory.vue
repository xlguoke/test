<template>
  <a-form ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol" :model="variableData">
    <a-form-item hidden>
      <a-input v-model:value="variableData.id" hidden />
    </a-form-item>
    <a-form-item hidden>
      <a-input
        v-model:value="variableData.inspectionCategoryId"
        hidden
      />
    </a-form-item>
    <a-form-item hidden>
      <a-input
        v-model:value="variableData.pid"
        hidden
      />
    </a-form-item>

    <a-form-item label="所属上级">
      <a-input
        v-model:value="variableData.inspectionCategory"
        disabled=""
      />
    </a-form-item>
    <a-form-item
      label="序号"
      :rules="[
        {
          required: true,
          validator: orderNumberChange,
          message: '请输入正整数',
        },
      ]"
      name="orderNumber"
    >
      <a-input-number
        v-model:value="variableData.orderNumber"
        placeholder="请输入序号"
      />
    </a-form-item>
    <a-form-item
      label="大类名称"
      :rules="[{ required: true, message: '请输入大类名称' }]"
      name="name"
    >
      <a-input
        v-model:value="variableData.name"
        placeholder="请输入大类名称"
      />
    </a-form-item>
  </a-form>
</template>

<script>
import { TreeSelect } from 'ant-design-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import api from '../../api'

const SHOW_ALL = TreeSelect.SHOW_ALL

export default {
  name: 'EditKeyPointCategory',
  props: {
    data: {},
    categoryData: {},
  },
  emits: ['cancel'],
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      variableData: {},
      SHOW_ALL,

      replaceFields: {
        children: 'children',
        title: 'name',
        value: 'id',
        key: 'id',
      },
    }
  },
  created() {
    this.variableData = JSON.parse(JSON.stringify(this.data))
  },
  methods: {
    orderNumberChange(rule, value, callback) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /(^\d+$)/
      if (!value || !reg.test(value)) {
        return callback(new Error(rule))
      }
      else {
        callback()
      }
    },
    submit() {
      this.$refs.formRef.validateFields().then(() => {
        api.keyPointCategory.edit({ ...this.variableData }).then(() => {
          $emit(this, 'cancel')
        })
      })
    },
  },
}
</script>

<style scoped></style>
