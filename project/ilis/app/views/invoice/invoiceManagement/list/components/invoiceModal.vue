<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="type == 'add' ? '发票登记' : '发票详情'"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      width="1000px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <Invoice
        v-if="visible"
        ref="Invoice"
        :type="type"
        :invoice-id="invoiceId"
      ></Invoice>
      <template v-if="type == 'detail'" #footer>
        <a-button type="primary" @click="cancelModal">
          关闭
        </a-button>
        <div style="clear: both"></div>
      </template>
      <template v-else #footer>
        <a-button @click="cancelModal">
          取消
        </a-button>
        <a-button type="primary" @click="handleSubmit">
          确定
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import Invoice from '../../invoice/index.vue'

export default {
  components: {
    Invoice,
  },
  props: ['callback'],
  data() {
    return {
      type: null, // "detail" "add" "edit"
      visible: false,
      confirmLoading: false,
      height: document.body.clientHeight,
      invoiceId: null,
    }
  },
  created() {},
  methods: {
    showModal(type, invoiceId) {
      this.type = type
      this.invoiceId = invoiceId
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
    handleSubmit() {
      this.confirmLoading = true
      this.$refs.Invoice.handleSubmit(() => {
        this.callback && this.callback()
        this.cancelModal()
      })
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-modal-body) {
  padding: 0;
}
</style>
