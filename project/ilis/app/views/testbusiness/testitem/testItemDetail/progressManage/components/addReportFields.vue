<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="新增上报字段"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="序号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input v-model:value="formState.columnIndex" placeholder="请输入序号" />
        </a-form-item>
        <a-form-item
          label="字段类型"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-select v-model:value="formState.columnType" placeholder="请选择字段类型">
            <a-select-option
              v-for="(item, index) in contentType"
              :key="index"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="字段名称"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input v-model:value="formState.columnName" placeholder="请输入字段名称" />
        </a-form-item>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'

export default {
  props: ['contentType', 'callback'],
  data() {
    return {
      id: getQueryVariable('id'),
      formState: {},
      visible: false,
      confirmLoading: false,
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const values = { ...this.formState }

        window.$oRest({
          method: 'POST',
          url: window.$oApi.testItem.column,
          data: {
            ...values,
            projectId: this.id,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res && res.code) {
            message.success(res.message)
            this.cancelModal()
            this.formState = {}
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.confirmLoading = false
        })
      })
    },
  },
}
</script>

<style></style>
