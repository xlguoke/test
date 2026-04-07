<template>
  <ht-modal
    v-model:open="visible"
    width="500px"
    :mask-closable="false"
    :keyboard="false"
    title="提示"
  >
    <div style="max-height: 60vh">
      <ImportSetting :id="dataId" :key="key" :task-id="testTaskId" />
    </div>

    <template #footer>
      <div class="clearfix">
        <a-button @click="visible = false">
          关闭
        </a-button>
        <a-button type="primary" :disabled="!!error" @click="okBtn">
          确定
        </a-button>
      </div>
    </template>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import ImportSetting from './ImportSetting.vue'

export default {
  components: { ImportSetting },
  emits: ['finish'],
  data() {
    return {
      visible: false,
      loading: false,
      key: '',
      dataId: '',
      testTaskId: '',
      error: '',
      params: [],
    }
  },
  methods: {
    showModal(id, testTaskId) {
      this.key = Date.now()
      this.error = ''
      this.visible = true
      this.dataId = id
      this.testTaskId = testTaskId
    },
    okBtn() {
      this.visible = false
      $emit(this, 'finish', { id: this.dataId, testTaskId: this.testTaskId })
    },
  },
}
</script>

<style lang="less" scoped></style>
