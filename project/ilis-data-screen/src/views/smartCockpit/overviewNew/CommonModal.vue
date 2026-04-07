<template>
  <a-modal
    :open="visible"
    width="95%"
    :z-index="1000"
    :centered="true"
    :mask-closable="false"
    :footer="false"
    :title="false"
    :closable="false"
    wrap-class-name="full-modal"
  >
    <!-- 中部插槽区域，使用默认插槽 -->
    <div class="full-modal-title">
      {{ modalTitle }}
      <CloseOutlined class="cursor-pointer" @click="handleCancel" />
    </div>
    <div
      class="flex flex-col pt-60 pr-120 pb-120 pl-120"
      :style="`height:calc(${modalHeight}px - 4rem)`"
    >
      <slot name="function"></slot>
      <div class="flex-1 h-0 flex flex-col">
        <div class="flex-1 h-0 overflow-hidden">
          <slot name="table"></slot>
        </div>
        <div class="text-right pt-30">
          <slot name="pagination"></slot>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue"
import { CloseOutlined } from "@ant-design/icons-vue"

defineProps<{
  modalTitle: string
}>()

const emits = defineEmits(["close"])

const modalHeight = document.body.clientHeight

const visible = ref(false)

// 暴露方法给父组件
const showModal = () => {
  visible.value = true
}

const hideModal = () => {
  emits("close")
  visible.value = false
}

const handleCancel = () => {
  hideModal()
}

defineExpose({
  showModal,
  hideModal
})
</script>

<style lang="less">
.full-modal {
  .full-modal-title {
    height: 1.2rem;
    background: linear-gradient(90deg, rgba(64, 231, 213, 0.2) 0%, rgba(64, 231, 213, 0.0902) 88%);
    background: url("../../../assets/images/smartCockpit/modal-title-bg.png") no-repeat;
    background-position: left;
    background-size: cover;
    font-size: 0.48rem;
    padding-left: 1.2rem;
    display: flex;
    align-items: center;
    color: #9afff4;
    font-weight: bold;
    justify-content: space-between;
    padding-right: 0.8rem;
  }

  .ant-modal-content {
    background: rgba(9, 20, 17, 0.9);
  }

  .ant-modal-body {
    padding: 0;
    font-size: 0.36rem;
    line-height: 0.46rem;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: 80%;
  }

  .ant-modal-body {
    flex: 1;
  }

  .ant-pagination {
    color: #fff;
    font-size: 0.36rem;

    .ant-pagination-options-quick-jumper {
      vertical-align: middle;

      input {
        background: rgba(64, 231, 213, 0.1);
        border-radius: 0.4rem;
        border: 0;
        color: #fff;
      }
    }

    .ant-pagination-disabled {
      .ant-pagination-item-link {
        span {
          color: #999;
        }
      }
    }

    .ant-pagination-item-link,
    .ant-pagination-item {
      background: transparent;
      border: none;

      &.ant-pagination-item-active {
        border-radius: 50%;
        background: #40e7d5;
      }

      span {
        font-weight: bold;
        color: #fff;
      }

      a {
        color: #fff;
      }
    }
  }
}
</style>
