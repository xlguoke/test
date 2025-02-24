<template>
  <a-modal
    v-model:open="visible"
    centered
    :mask-closable="false"
    :keyboard="false"
    :footer="null"
    :title="title"
    width="80%"
    :destroy-on-close="destroyOnClose"
    @cancel="handleCancel"
  >
    <div class="ht-modal-body">
      <slot />
    </div>
    <div class="ht-modal-footer">
      <slot name="footer" :handle-submit="handleSubmit" :handle-cancel="handleCancel">
        <a-button v-if="!hideOkBtn" type="primary" @click="handleSubmit">
          {{ okText }}
        </a-button>
        <a-button @click="handleCancel">
          关 闭
        </a-button>
      </slot>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: Boolean,
  destroyOnClose: Boolean, // 关闭弹窗销毁内容
  hideFullScreen: Boolean, // 隐藏右上角全屏图标
  isFullScreen: Boolean, // 默认全屏
  hideOkBtn: Boolean, // 隐藏确定按钮
  hideCloseIcon: Boolean, // 隐藏右上角关闭图标
  autoHeight: Boolean, // 自定义高度，非全屏时生效
  businessType: String, // 业务类型
  width: {
    type: String,
    default: '80%',
  },
  title: {
    type: String,
    default: '上传文件',
  },
  okText: {
    type: String,
    default: '确 定',
  },
})

const emits = defineEmits(['update:modelValue', 'changeFull', 'cancel', 'ok'])

const fullScreen = ref(props.isFullScreen)

const visible = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emits('update:modelValue', val)
})

watch(fullScreen, (val) => {
  emits('changeFull', val)
})

function handleCancel() {
  visible.value = false
  emits('cancel')
}

function handleSubmit() {
  emits('ok')
}
</script>

<style lang="less" scoped>
:deep(.ant-modal) {
  top: 5%;
  .ant-modal-close-x {
    font-size: 16px;
  }
  .ant-modal-body {
    position: relative;
    padding: 0;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 140px);
    min-height: 350px;
    overflow-y: hidden;
    .ht-modal-body {
      flex: 1;
      padding: 8px 16px;
      height: 0;
      overflow-y: auto;
      & > .ant-spin-nested-loading {
        height: 100%;

        & > .ant-spin-container {
          height: 100%;
          overflow-y: auto;
        }
      }
    }
  }
}
:deep(.auto-height) {
  .ant-modal {
    top: 15%;
  }
  .ant-modal-body {
    height: auto;
    min-height: 200px;
  }
}

:deep(.iframe-content){
  overflow: hidden;
  .ant-modal{
    top: 10px;
    .ant-modal-body{
      height: calc(100vh - 60px);
    }
  }
}

.ht-modal-head {
  & > .title {
    font-size: 14px;
  }
  .icons {
    float: right;
    line-height: 22px;
    cursor: pointer;
    gap: 10px;
    .i {
      margin-left: 8px;
      font-size: 16px;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
.ht-modal-footer {
  width: 100%;
  padding: 12px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
  text-align: right;
  z-index: 100;
  .ant-btn {
    margin-left: 8px;
  }
}
</style>
