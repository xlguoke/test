<template>
  <div>
    <ht-modal
      title="按采购申请入库"
      centered
      :open="visible"
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      width="80%"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <iframe
        v-if="visible"
        ref="iframeObj"
        :src="src"
        frameborder="0"
        width="100%"
        :height="iframeHeight"
      ></iframe>
      <template #footer>
        <a-button @click="handleCancel">
          关闭
        </a-button>
        <a-button :loading="saveLoading" @click="onSave()">
          暂存
        </a-button>
        <a-button type="primary" :loading="confirmLoading" @click="handleOk">
          确认
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  emits: ['onSave'],
  data() {
    return {
      src: `${import.meta.env.VITE_ILIS_BASE}/rest/purchase/view/store?requestType=CHEMICAL&type=checkbox`,
      visible: false,
      iframeHeight: `${document.body.clientHeight - 200}px`,
      confirmLoading: false,
      saveLoading: false,
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    async onSave(cb) {
      const formData = this.$refs.iframeObj.contentWindow.getFormDataChemical()

      if (formData) {
        if (cb) {
          this.confirmLoading = true
        }
        else {
          this.saveLoading = true
        }
        const res = await window.$oAjax({
          method: 'POST',
          url: `rest/chemical/inventory/in/batch-save`,
          data: JSON.stringify(formData),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).finally(() => {
          if (cb) {
            this.confirmLoading = false
          }
          else {
            this.saveLoading = false
          }
        })

        if (res.code !== 20010) {
          if (cb) {
            cb(res.data)
          }
          else {
            $emit(this, 'onSave')
            window.$oAntdMessage.success('操作成功')
            this.handleCancel()
          }
        }
        else {
          window.$oAntdMessage.warn(res.msg || res.message)
        }
      }
    },
    async handleOk() {
      this.onSave(async (data) => {
        this.confirmLoading = true
        const res = await window.$oAjax({
          method: 'PUT',
          url: `rest/chemical/inventory/in/batch-put-away`,
          data: JSON.stringify(data),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).finally(() => {
          this.confirmLoading = false
        })

        if (res.code !== 20010) {
          $emit(this, 'onSave')
          window.$oAntdMessage.success('操作成功')
          this.handleCancel()
        }
        else {
          window.$oAntdMessage.warn(res.msg || res.message)
        }
      })
    },
    async handleCancel() {
      this.visible = false
    },
  },
}
</script>
