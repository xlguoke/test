<template>
  <a-modal
    v-model:open="visible"
    centered
    width="320"
    title="提示"
    :keyboard="false"
    :mask-closable="false"
  >
    <p class="my-4">
      {{ props.content }}
    </p>
    <a-slider
      v-model:value="process"
      :tip-formatter="null"
      @after-change="afterChange"
    />
    <template #footer>
      <a-button @click="handleCancel()">
        取消
      </a-button>
      <a-button :disabled="process < 100" type="primary" @click="handleOk()">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
const props = defineProps({
  content: {
    type: String,
    default: '出于风险考虑，请将滑块移动到最右侧进行验证',
  },
})

/** 验证通过回调 */
let successCb = null

const visible = ref(false)

const process = ref(0)

function afterChange() {
  if (process.value < 100) {
    process.value = 0
  }
}

function open(cb: () => void) {
  process.value = 0
  visible.value = true

  successCb = cb
}

function handleOk() {
  if (successCb) {
    successCb()
  }

  handleCancel()
}

function handleCancel() {
  visible.value = false
  process.value = 0
}

defineExpose({
  open,
})
</script>
