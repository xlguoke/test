<template>
  <ht-modal v-bind="$attrs" v-model:open="_value" class="hitek-modal">
    <slot name="content"></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </ht-modal>
</template>

<script>
// 此组件基于antd-vue框架的modal组件开发
import canDragModal from '~/providers/common/util/canDragModal'

let ele

export default {
  props: ['value'],
  emits: ['update:value'],
  data() {
    return {}
  },
  computed: {
    _value() { return this.value },
  },
  watch: {
    value(newVal) {
      if (newVal === true) {
        window.$oNextTick(() => {
          setTimeout(() => {
            // eslint-disable-next-line new-cap
            ele = new canDragModal(this)
          }, 1000)
        })
      }
      else {
        ele.reset()
        ele = null
      }
    },
  },
  methods: {},
}
</script>

<style lang="less" scoped>
.hitek-modal {
  :deep(.ant-modal) {
    padding-bottom: 0;
  }

  :deep(.ant-modal-header) {
    cursor: move;
  }
}
</style>
