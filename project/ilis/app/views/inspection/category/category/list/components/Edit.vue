<template>
  <a-form ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol" :model="variableData">
    <a-form-item hidden>
      <a-input v-model:value="variableData.id" hidden />
    </a-form-item>
    <a-form-item
      label="序号"
      :rules="[
        {
          required: true,
          validator: orderNumberChange,
          message: '请输入正确的序号',
        },
      ]"
      name="sn"
    >
      <a-input-number
        v-model:value="variableData.sn"
        width="100%"
        placeholder="请输入序号"
      />
    </a-form-item>
    <a-form-item
      label="检查类型" :rules="[{ required: true, message: '请输入检查类型' }]"
      name="name"
    >
      <a-input
        v-model:value="variableData.name"
        placeholder="请输入检查类型"
      />
    </a-form-item>
    <a-form-item label="启用检查审批" name="enableInspectionAudit">
      <a-switch
        v-model:checked="variableData.enableInspectionAudit"
      />
    </a-form-item>
    <a-form-item label="启用整改审批" name="enableReformAudit">
      <a-switch
        v-model:checked="variableData.enableReformAudit"
      />
    </a-form-item>
    <a-form-item label="备注" name="remark">
      <a-textarea
        v-model:value="variableData.remark"
        placeholder="请输入备注"
        :auto-size="{ minRows: 3, maxRows: 10 }"
      />
    </a-form-item>
  </a-form>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { request } from '../../request'

export default {
  name: 'Edit',
  props: {
    data: {},
  },
  emits: ['cancel'],
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      sort: {},
      category: {},
      variableData: {},

    }
  },
  created() {
    const { id, sn, name, enableInspectionAudit, enableReformAudit, remark, codeRule } = this.data
    this.variableData = {
      id,
      sn,
      name,
      enableInspectionAudit,
      enableReformAudit,
      remark,
      codeRule,
    }
  },
  methods: {
    orderNumberChange(rule, value, callback) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /(^\d+$)/
      if (!value) {
        return callback(new Error('请输入正确的序号'))
      }
      else if (!reg.test(value)) {
        return callback(new Error('请输入正确的序号'))
      }
      else {
        callback()
      }
    },
    submit() {
      this.$refs.formRef.validateFields().then(() => {
        request.category.edit(this.variableData).then(() => {
          $emit(this, 'cancel')
        })
      })
    },
  },
}
</script>

<style scoped>
.ant-input-number {
  width: 100% !important;
}
</style>
