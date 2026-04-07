<template>
  <ht-modal
    v-model:open="visible"
    :title="title"
    width="70%"
    fixed-height
    destroy-on-close
    @cancel="onCancel"
    @ok="onOk"
  >
    <WEditor v-model:value="content" :height="height" :placeholder="placeholder" />
  </ht-modal>
</template>

<script setup lang='ts'>
import WEditor from './WEditor.vue'

interface PropData {
  /** 内容 */
  content: string
  /** 弹窗标题 */
  title?: string
  /** 富文本提示信息 */
  placeholder?: string
  /** 富文本内容高度 */
  height?: number
}

const emits = defineEmits(['cancel', 'ok'])

const visible = ref(false)
const title = ref('')
const content = ref('')
const placeholder = ref('')
const height = ref(300)

/**
 * 打开弹窗
 * 为兼容jsp页面使用，打开弹窗通过调用方法实现
 */
function openModal(data: PropData) {
  title.value = data?.title || '标题'
  visible.value = true
  nextTick(() => {
    content.value = data?.content || ''
    placeholder.value = data?.placeholder || '请输入内容'
    height.value = data?.height || 300
  })
}

function onCancel() {
  visible.value = false
  content.value = ''
  if (window.vm_weditorCancel) {
    window.vm_weditorCancel()
  }
  emits('cancel')
}

function onOk() {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu
  // 过滤掉所有emoji
  const filteredValue = content.value.replace(emojiRegex, '')
  content.value = filteredValue
  if (window.vm_weditorConfirm) {
    window.vm_weditorConfirm(content.value)
  }
  emits('ok', content.value)
  onCancel()
}

defineExpose({
  openModal,
})

if (!window.vm) {
  window.vm = {}
}
window.vm.openEditorModal = openModal
</script>

<style scoped>

</style>
