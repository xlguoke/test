<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="title"
      ok-text="确定"
      cancel-text="取消"
      :destroy-on-close="true"
      @ok="handleOk"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="监管系统名称"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: '监管系统名称不能为空！' }]"
          name="name"
        >
          <a-input
            v-model:value="data.name"
            placeholder="请输入监管系统名称"
          />
        </a-form-item>
        <a-form-item
          label="管理单位"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: '管理单位不能为空！' }]"
          name="agency"
        >
          <a-input
            v-model:value="data.agency"
            placeholder="请输入管理单位"
          />
        </a-form-item>
        <a-form-item
          label="排序"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[
            {
              required: true,
              validator: integer,
              message: '请输入正整数',
            },
          ]"
          name="sort"
        >
          <a-input
            v-model:value="data.sort"
            placeholder="请输入排序"
          />
        </a-form-item>
        <a-form-item
          label="备注"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="data.remark"
            placeholder="请输备注入"
          />
        </a-form-item>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
export default {
  name: 'Regulatory',
  props: ['callback', 'edit'],
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
      visible: false,
      data: {},
      title: '新增监管系统',

    }
  },
  methods: {
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.data }
        let request, defaultErrorMsg
        if (this.edit) {
          defaultErrorMsg = '监管系统编辑失败'
          request = window.$oAjax.put(
            `rest/regulatory`,
            { ...values, id: this.data.id },
            {
              headers: { 'content-type': 'application/json' },
            },
          )
        }
        else {
          defaultErrorMsg = '监管系统添加失败'
          request = window.$oAjax.post(`rest/regulatory`, values, {
            headers: { 'content-type': 'application/json' },
          })
        }
        request.then((res) => {
          if (res.code === 22000 || res.code === 21000) {
            this.visible = false
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || defaultErrorMsg))
          }
        })
      })
    },
    show(current) {
      this.visible = true
      this.data = { ...current }
      if (current)
        this.title = '编辑监管系统'
    },
    integer(rule, value, callback) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /(^\d+$)/
      if (!value || !reg.test(value)) {
        return callback(new Error(rule))
      }
      else {
        callback()
      }
    },
  },
}
</script>

<style scoped></style>
