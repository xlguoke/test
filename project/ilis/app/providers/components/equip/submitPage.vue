<template>
  <ht-modal
    v-model:open="visible"
    title="提交审核"
    :confirm-loading="confirmLoading"
    width="520px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <ProcessForm
      ref="processFormRef"
      :key="key"
      :process-type="auditTypeId"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    />
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'

export default {
  props: ['callback'],
  data() {
    return {
      dayjs,
      key: 0,
      visible: false,
      confirmLoading: false,
      spinning: false,
      dataObj: {},
    }
  },
  methods: {
    showModal(data, auditTypeId) {
      this.key++
      this.auditTypeId = auditTypeId
      this.dataObj = data
      this.visible = true
    },
    async handleOk() {
      const data = await this.$refs.processFormRef.getProcessFormData()
      const query = {
        ...data,
        presetAuditers: JSON.stringify(data.presetAuditers),
        formPropertyJson: JSON.stringify(data.formPropertyJson),
        id: this.dataObj.id,
      }
      this.confirmLoading = true

      this.callback(query)
    },
    handleCancel() {
      this.visible = false
      this.confirmLoading = false
      this.dataObj = {}
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: 450px;
    overflow-y: auto;
  }
}
</style>
