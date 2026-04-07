<template>
  <div>
    <ht-modal
      :open="visible"
      :title="title"
      centered
      :keyboard="false"
      @cancel="handleCancel"
    >
      <template #footer>
        <a-button @click="handleCancel">
          取消
        </a-button>
        <a-button type="primary" :loading="loading" @click="handleOk">
          确认
        </a-button>
      </template>
      <p>
        此操作会根据设备的检校状态将标签设置为不同的标签颜色（红色为检校过期的颜色，否则为正常黑白色标签)。更新情况可以直接<span
          style="color: #1890ff; cursor: pointer"
          @click="handleDetail"
        >查看墨水屏更新记录。</span>
      </p>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { updateLabel } from '../../api/index'

export default {
  emits: ['update'],
  data() {
    return {
      title: '提示',
      loading: false,
      visible: false,
      seledtRow: [],
    }
  },
  methods: {
    showModel(seledtRow) {
      this.visible = true
      this.seledtRow = seledtRow
    },
    // 新增
    async handleOk() {
      try {
        this.loading = true
        let idData = []
        let ids = ''
        if (this.seledtRow && this.seledtRow.length) {
          idData = this.seledtRow.map(item => item.id)
          ids = idData.join(',')
        }
        const result = await updateLabel(ids)
        if (result.data.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.visible = false
          $emit(this, 'update')
        }
      }
      catch (e) {
        window.$oAntdMessage.error(e.data.message || '更新失败')
      }
      finally {
        this.loading = false
      }
    },
    // 取消
    handleCancel() {
      this.visible = false
      this.seledtRow = []
      // 重置数据
    },
    handleDetail() {

    },
  },
}
</script>
