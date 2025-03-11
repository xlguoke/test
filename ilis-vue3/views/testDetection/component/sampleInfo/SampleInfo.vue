<template>
  <AppProvider>
    <div class="h-full flex flex-col">
      <div class="p-1 flex-1 h-0">
        <Index
          ref="sampleInfoRef"
          :task-id="taskId"
          :blind="blind"
          :disabled="disabled"
        />
      </div>
      <div class="p-3 border border-e-gray-400 text-right">
        <a-button v-if="!hideClose" class="mr-3" @click="cancelModal">
          取消
        </a-button>
        <a-button type="primary" @click="handleSubmit">
          确定
        </a-button>
      </div>
    </div>
  </AppProvider>
</template>

<script setup lang='ts'>
import Index from './components/Index.vue'

const taskId = ref('')
const blind = ref(false)
const disabled = ref(false)
const hideClose = ref(false)

const params = new URLSearchParams(location.search)
taskId.value = params.get('taskId') || ''
blind.value = params.get('blind') === '1'
disabled.value = params.get('view') === '1'
hideClose.value = params.get('hideClose') === '1'

const sampleInfoRef = ref()
function handleSubmit() {
  const data = sampleInfoRef.value.submit()
  if (!parent.sampleInfoLayerConfirm) {
    console.error('没找到 sampleInfoLayerConfirm 方法')
    return
  }
  parent.sampleInfoLayerConfirm(data)
}

function cancelModal() {
  if (!parent.sampleInfoLayerClose) {
    console.error('没找到 sampleInfoLayerClose 方法')
    return
  }
  parent.sampleInfoLayerClose()
}

(window as any)._package = () => handleSubmit()
</script>

<style>
#sample_info{
  height: 100%;
}
</style>
