<template>
  <IlisCustomColumnsContent
    ref="ilisCustomColumnsContentRef"
    :type="queryType"
  />
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  data() {
    return {
      queryType: getQueryVariable('queryType') || 'consignLedger', // 模块类型 列表
    }
  },
  mounted() {
    window.layerOkCallback = this.okBtn
  },
  methods: {
    async okBtn(cb) {
      const okRes = []
      await this.$refs.ilisCustomColumnsContentRef.handleConfirm()
      okRes.push({ msg: '修改成功', success: true })
      if (cb)
        cb(okRes)
      if (okRes.length)
        return okRes
    },
  },
}
</script>

<style lang="less" scoped>
.draggableBox .custom-height {
  height: calc(100vh - 150px) !important;
}
</style>
