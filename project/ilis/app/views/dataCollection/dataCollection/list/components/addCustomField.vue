<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="新增"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="序号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          name="columnIndex"
          :rules="[
            { required: true, message: '序号为必填项且必须是数字！' },
          ]"
        >
          <a-input-number
            v-model:value="formState.columnIndex"
            style="width: 100%"
            placeholder="请输入序号"
          />
        </a-form-item>
        <a-form-item
          label="标题"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          name="columnName"
          :rules="[
            { required: true, message: '标题为必填项！' },
          ]"
        >
          <a-input
            v-model:value="formState.columnName"
            placeholder="请输入标题"
          />
        </a-form-item>
        <a-form-item
          label="内容类型"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          name="columnType"
          :rules="[
            { required: true, message: '内容类型为必选项！' },
          ]"
        >
          <a-select
            v-model:value="formState.columnType"
            placeholder="请选择内容类型"
          >
            <a-select-option
              v-for="(item, index) in contentType"
              :key="index"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  props: ['callback', 'contentType'],
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
      this.formState = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true

        window.$oAjax({
          method: 'POST',
          url: window.$oApi.dataCollection.addCustomField,
          data: {
            ...this.formState,
            customizeType: 'data',
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res && res.success) {
            window.$oAntdMessage.success(res.message || res.msg)
            this.cancelModal()
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
