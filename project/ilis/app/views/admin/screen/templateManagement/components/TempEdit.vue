<template>
  <HtModal
    v-model:open="visible"
    title="功能室配置"
    width="100vw"
    :footer="null"
    :confirm-loading="loading"
    :after-close="onClosed"
    full-screen
  >
    <Editor
      @cancel="visible = false"
      @save="handleSave"
      @preview="handlePreview"
    />
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useScreenEditorStore } from '~/store/screenEditorStore.ts'
import Editor from '~/views/admin/screen/editor/index.vue'
import { screenBaseUrl } from '../../configuration/index.ts'
import { editScreenTemplate } from '../api.ts'
import { ScreenTemplateEntity } from '../ScreenTemplateEntity'

const props = defineProps<IDialogPropsParam<null, ScreenTemplateEntity>>()

const { renderWidgets, baseConfigFormState } = toRefs(useScreenEditorStore())

const loading = ref(false)

const visible = ref(true)

const formData = ScreenTemplateEntity.fromJSON(props.param)

function init() {
  if (formData.metadata) {
    const parsedData = JSON.parse(formData.metadata)
    renderWidgets.value = parsedData?.renderWidgets
    baseConfigFormState.value = parsedData?.baseConfigFormState
  }
  else {
    renderWidgets.value = []
    baseConfigFormState.value = {}
  }
}
init()

function handlePreview() {
  if (!props?.param?.url) {
    message.error('该屏幕没有配置地址')
  }

  const query = new URLSearchParams({
    isPreViewFunc: '1',
    unitCode: localStorage.getItem('unitCode') || '',
  })

  const previewUrl = new URL(screenBaseUrl)
  previewUrl.search = query.toString()
  window.open(previewUrl.href)
}

async function handleSave() {
  formData.metadata = JSON.stringify({
    renderWidgets: renderWidgets.value,
    baseConfigFormState: baseConfigFormState.value,
  })
  loading.value = true
  await editScreenTemplate(formData).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
