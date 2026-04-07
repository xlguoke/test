<template>
  <div>
    <ht-modal
      title="扫描查询中，请等待..."
      :open="visible"
      centered
      class="sampleScanRecord-scan"
      :mask-closable="false"
      width="460px"
      @cancel="handleCancel"
    >
      <div class="sampleScanRecord-scan-wrap">
        <div class="sampleScanRecord-scan-radar"></div>
      </div>
      <template #footer>
        <a-button type="primary" @click="handleCancel">
          关闭
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: ['callback'],
  emits: ['scan-sucesss'],
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    getData() {
      setTimeout(() => {
        window.$oAntdMessage.success('已扫描到RFID识别码')
        $emit(this, 'scan-sucesss', 'test123456789')
        this.handleCancel()
      }, 3 * 1000)
      // window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
      //   if (res && res.length > 0) {
      //   }
      // });
    },
    showModal() {
      this.visible = true
      window.$oNextTick(() => {
        this.getData()
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./scan.less');
</style>
