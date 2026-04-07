<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="新增"
      centered
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
          :rules="[
            { required: true, message: '序号为必填项且必须是数字！' },
          ]"
          name="columnIndex"
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
          :rules="[{ required: true, message: '标题为必填项！' }]"
          name="columnName"
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
          :rules="[{ required: true, message: '内容类型为必选项！' }]"
          name="columnType"
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
import { message } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'

export default {
  props: ['callback', 'contentType'],
  data() {
    return {
      id: getQueryVariable('id'),

      visible: false,
      confirmLoading: false,
      formState: {},
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
          url: window.$oApi.biddingPerformance.addCustomField,
          data: {
            ...this.formState,
            customizeType: 'person',
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res && res.success) {
            message.success(res.message || res.msg)
            this.cancelModal()
            this.callback()
          }
          else {
            message.error(res.message || res.msg)
          }
          this.confirmLoading = false
        })
      })
    },
  },
}
</script>

<style></style>
