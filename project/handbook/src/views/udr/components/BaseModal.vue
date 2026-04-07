<script setup lang="ts">
import { computed, watch } from 'vue'
import { udrCore } from '@/views/udr/provider/UdrCore'
import TitleBar from '@/layout/components/TitleBar.vue'

const props = defineProps({
  title: {
    type: String,
    defalut: '任务列表',
  },
  show: {
    type: Boolean,
    default: false,
  },
  hideFooter: Boolean,
  /** 关闭弹窗时，是否显示udr，默认显示 —— 弹窗内嵌套弹窗时，关闭内部弹窗不应显示udr */
  udrVisible: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['update:show', 'close'])

const show = computed({
  get() {
    return props.show
  },
  set(val) {
    emits('update:show', val)
  },
})

watch(show, (val) => {
  if (val === true) {
    udrCore.$this.setUdrVisibility(false)
  }
  else if (props.udrVisible) {
    setTimeout(() => {
      udrCore.$this.setUdrVisibility(true)
    }, 100)
  }
})

function onClose() {
  emits('close')
}
</script>

<template>
  <van-popup v-model:show="show" v-bind="$attrs" class="udr-popup-wrapper" teleport="body" @click="show = false">
    <div class="base-modal" @click.stop>
      <slot name="header">
        <TitleBar style="position: relative;" :title="title">
          <template #left>
            <van-icon name="arrow-left" @click="onClose" />
          </template>
        </TitleBar>
      </slot>

      <div class="base-modal-body">
        <slot />
      </div>

      <div v-if="!hideFooter" class="base-modal-footer">
        <slot name="footer">
          <van-button block type="primary" @click="onClose">
            关闭
          </van-button>
        </slot>
      </div>
    </div>
  </van-popup>
</template>

<style lang="less" scoped>
.udr-popup-wrapper{
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
}
.base-modal {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #F8F8F9;
  position: relative;

  .base-modal-body {
    position: relative;
    flex: 1;
    overflow-y: auto;
  }

  .base-modal-footer {
    display: flex;
    padding: 10px 16px;
    border-top: solid 1px #e2e2e2;
    justify-content: flex-end;
  }
}
</style>
