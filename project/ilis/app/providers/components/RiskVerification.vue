<template>
  <ht-modal
    v-model:open="visible"
    title="提示"
    :mask-closable="false"
    width="460px"
  >
    <p>{{ content }}</p>
    <div style="padding: 0 8px; margin-top: 32px">
      <a-slider
        v-model:value="sliderVal"
        :tip-formatter="null"
        @after-change="onAfterChange"
      />
    </div>

    <template #footer>
      <a-button type="primary" :disabled="sliderVal !== 100" @click="onOk">
        确认
      </a-button>
      <a-button @click="onCancel">
        取消
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
export default {
  props: ['content'],
  data() {
    return {
      sliderVal: 0,
      visible: false,
      successCb: null,
      cancelCb: null,
    }
  },
  methods: {
    open(cb, cancelCb) {
      this.successCb = cb
      this.cancelCb = cancelCb
      this.visible = true
    },
    onAfterChange() {
      if (this.sliderVal !== 100) {
        this.sliderVal = 0
      }
    },
    onOk() {
      if (this.successCb) {
        this.successCb()
      }
      this.visible = false
      this.onReset()
    },
    onCancel() {
      if (this.cancelCb) {
        this.cancelCb()
      }

      this.visible = false
      this.onReset()
    },
    onReset() {
      this.successCb = null
      this.cancelCb = null
      this.sliderVal = 0
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-slider-handle) {
  width: 24px;
  height: 24px;
  margin-top: -12px;
}
</style>
