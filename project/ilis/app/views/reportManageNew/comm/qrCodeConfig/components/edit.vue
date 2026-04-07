<template>
  <ht-modal
    v-model:open="visible"
    title="系统字段编辑"
    :confirm-loading="confirmLoading"
    @cancel="cancelModal"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="data">
      <a-form-item
        label="系统字段"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 15 }"
      >
        <a-input
          v-model:value="data.columnName"
          :disabled="true"
        />
      </a-form-item>
      <a-form-item
        label="显示名称"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 15 }"
        :rules="[{ pattern: /(^\S)((.)*\S)?(\S*$)/, message: '前后不能有空格' }]"
        name="displayName"
      >
        <a-input
          v-model:value="data.displayName"
          :max-length="50"
        />
      </a-form-item>
      <a-form-item
        label="是否显示"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 15 }"
      >
        <a-switch v-model:checked="data.shown" />
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script>
import { message } from 'ant-design-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'Edit',
  props: ['value', 'row', 'afterUpdate'],
  emits: ['update:value'],
  data() {
    return {
      uploadVisible: false,
      confirmLoading: false,
      visible: this.value,
      data: {},
    }
  },
  watch: {
    value(val) {
      this.visible = val
    },
    visible(val) {
      if (val === false) {
        this.cancelModal()
      }
      else {
        this.data = { ...this.row }
      }
    },
  },
  methods: {
    cancelModal() {
      $emit(this, 'update:value', false)
      this.data = {}
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const values = { ...this.data }

        window.$oAjax
          .post(
            `${window.$oApi.qrCodeConfig.update}`,
            { id: this.data.id, ...values },
            {
              headers: {
                'content-type': 'application/json',
              },
            },
          )
          .then(
            (res) => {
              if (Number.parseInt(res.code) === 22000) {
                this.cancelModal()
                window.$oAntdMessage.success('操作成功！')
              }
              else {
                message.error(res.message || res.msg)
              }
              this.confirmLoading = false

              this.afterUpdate && this.afterUpdate()
            },
          )
          .catch(() => {
            this.confirmLoading = false
          })
      })
    },
  },
}
</script>

<style></style>
