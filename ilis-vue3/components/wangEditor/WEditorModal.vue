<template>
  <AppProvider>
    <ht-modal
      v-model:open="visible"
      :title="title"
      width="70%"
      destroy-on-close
      @cancel="onCancel"
      @ok="onOk"
    >
      <WEditor v-model:value="content" :height="height" :placeholder="placeholder" />
    </ht-modal>
  </AppProvider>
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
