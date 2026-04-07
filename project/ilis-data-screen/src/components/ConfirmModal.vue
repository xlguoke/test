<template>
  <div v-show="value" :class="`p-modal ${value ? 'show-modal' : ''}`">
    <div class="p-modal-wrap font-ys">
      <div class="p-modal-head">
        {{ title }}
      </div>
      <div class="p-modal-body tip-modal-body">
        <slot></slot>
      </div>
      <div class="p-modal-foot">
        <p v-if="!closeCancel" class="p-btn" @click="onClose">
          {{ cancelText }}
        </p>
        <p class="p-btn confirm" @click="okConfirm">
          {{ confirmText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  value: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "提示"
  },
  closeCancel: Boolean,
  cancelText: {
    type: String,
    default: "取消"
  },
  confirmText: {
    type: String,
    default: "确认"
  }
})
const emit = defineEmits(["update:value", "cancel", "confirm"])

function okConfirm() {
  emit("confirm")
}
function onClose() {
  emit("update:value", false)
  emit("cancel")
}
</script>

<style scoped lang="less">
.p-modal {
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  font-size: 0.36rem;
  z-index: 100;
  background-color: rgba(5, 29, 65, 0.7);
  opacity: 0;
  animation: showModal 0.3s ease-out;
  -webkit-animation: showModal 0.3s ease-out;

  &.show-modal {
    opacity: 1;
  }

  .p-modal-wrap {
    padding: 0.15rem 0.2rem;
    width: 8.77rem;
    height: auto;
    border: 1px solid #1890ff;
    box-sizing: border-box;
    background-color: rgba(5, 29, 65, 1);
    box-shadow: inset 0px 0px 23px 0px rgba(0, 149, 255, 0.6);
    overflow: hidden;

    .p-modal-head {
      line-height: 0.72rem;
      background: linear-gradient(to right, transparent, #33aaff, transparent);
      text-align: center;
      color: #fff;
    }

    .p-modal-body {
      margin: 0.2rem 0;
      padding: 0.2rem;
      min-height: 5rem;
      max-height: 8rem;
      overflow-y: auto;
    }

    .tip-modal-body {
      min-height: 1rem;
    }

    .p-modal-foot {
      text-align: right;
      padding: 0.1rem;

      .p-btn {
        display: inline-block;
        padding: 0.05rem 0.2rem;
        margin-left: 0.3rem;
        border: 1px solid #1890ff;
        color: #fff;
        cursor: pointer;
      }

      .confirm {
        background: linear-gradient(180deg, #18e8ff 0%, #1890ff 100%);

        &.disabled {
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
