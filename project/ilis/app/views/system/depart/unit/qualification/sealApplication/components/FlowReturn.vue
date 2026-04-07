<template>
  <ht-modal
    title="流程退回"
    width="460px"
    :open="value"
    :closable="false"
    :mask-closable="false"
    :destroy-on-close="true"
    :confirm-loading="confirmLoading"
    @ok="submit"
    @cancel="cancel"
  >
    <label>退回至：</label>
    <a-select v-model:value="target" class="mt-2 mb-4" style="width: 100%">
      <a-select-option value="consign">
        委托收样
      </a-select-option>
      <a-select-option value="testTask">
        试验检测
      </a-select-option>
      <a-select-option value="reportAudit">
        报告审核
      </a-select-option>
      <a-select-option value="reportApprove">
        报告批准
      </a-select-option>
    </a-select>

    <label>退回原因：</label>
    <a-textarea
      v-model:value="reason"
      class="mt-2"
      placeholder="请输入退回原因"
      :rows="8"
    />
  </ht-modal>
</template>

<script>
import { BusinessRollbackControllerService } from '~/providers/providers/services/businessRollbackController'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const businessRollbackControllerService
  = new BusinessRollbackControllerService()

export default {
  props: ['value', 'reportIds'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      target: 'consign',
      reason: '',
      confirmLoading: false,
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.target = 'consign'
        this.reason = ''
      }
    },
  },
  methods: {
    async submit() {
      this.confirmLoading = true
      const res = await businessRollbackControllerService
        .rollback({
          source: 'reportPrint',
          sourceObjId: this.reportIds.join(','),
          target: this.target,
          reason: this.reason,
        })
        .finally(() => {
          this.confirmLoading = false
        })

      if (res.success !== false) {
        window.$oAntdMessage.success('操作成功！')
        $emit(this, 'on-success')
        this.cancel()
      }
    },
    cancel() {
      $emit(this, 'update:value', false)
    },
  },
}
</script>
