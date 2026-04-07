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
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  emits: ['onSave'],
  data() {
    return {
      src: `/ilis2/rest/purchase/view/store?requestType=CONSUMABLE`,
      visible: false,
      iframeHeight: `${document.body.clientHeight - 200}px`,
      confirmLoading: false,
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    async handleOk() {
      const formData = this.$refs.iframeObj.contentWindow.getFormData()

      if (formData) {
        this.confirmLoading = true
        const res = await window.$oAjax({
          method: 'POST',
          url: `rest/consumablesController/batch/storage`,
          data: JSON.stringify(formData),
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
      }
    },
    async handleCancel() {
      this.visible = false
    },
  },
}
</script>
