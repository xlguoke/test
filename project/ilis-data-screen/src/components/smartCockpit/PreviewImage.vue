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
      {{ title }}
      <CloseOutlined class="cursor-pointer" @click="handleCancel" />
    </div>
    <div
      class="flex flex-col pt-60 items-center justify-center"
      :style="`height:calc(${modalHeight}px - 4rem)`"
    >
      <img :src="url" class="max-w-[100%] max-h-[100%]" />
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { CloseOutlined } from "@ant-design/icons-vue"

const modalHeight = document.body.clientHeight

const visible = ref(false)

const title = ref("查看详情")

const url = ref("")

function open(options) {
  url.value = options.url
  title.value = options.title || "查看详情"
  visible.value = true
}

function handleCancel() {
  visible.value = false
}

defineExpose({
  open
})
</script>

<style lang="less">
.full-modal {
  .full-modal-title {
    height: 1.2rem;
    background: linear-gradient(90deg, rgba(64, 231, 213, 0.2) 0%, rgba(64, 231, 213, 0.0902) 88%);
    background: url("../../assets/images/smartCockpit/modal-title-bg.png") no-repeat;
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
}
</style>
