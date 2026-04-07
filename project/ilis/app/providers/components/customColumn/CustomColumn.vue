<template>
  <ht-modal
    v-model:open="visible"
    :title="title"
    width="50%"
    destroy-on-close
    @cancel="visible = false"
    @ok="okBtn"
  >
    <IlisCustomColumnsContent
      ref="ilisCustomColumnsContentRef"
      :key="queryType"
      :type="queryType"
    />
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  emits: ['okBtn'],
  data() {
    return {
      queryType: '', // 模块类型 列表
      title: '列筛选',
      visible: false,
    }
  },
  methods: {
    showModal(queryType, title) {
      if (!queryType) {
        console.error('请传入模块类型')
        return
      }
      this.visible = true
      this.queryType = queryType
      this.title = title
    },
    async okBtn() {
      const okRes = []
      await this.$refs.ilisCustomColumnsContentRef.handleConfirm()
      okRes.push({ msg: '修改成功', success: true })
      if (okRes.length) {
        $emit(this, 'okBtn', okRes)
        this.visible = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.draggableBox .custom-height {
  height: calc(100vh - 150px) !important;
}
</style>
