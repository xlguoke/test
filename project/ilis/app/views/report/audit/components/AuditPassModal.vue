<template>
  <HtModal
    v-model:open="showDialog"
    :after-close="onClosed"
    title="审核通过"
    width="80%"
    fixed-height
    @ok="handleOk"
  >
    <iframe ref="iframeRef" :src="props.param.url" frameborder="0" width="100%" height="100%"></iframe>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'

interface IProps {
  url: string
}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const showDialog = ref(true)

const iframeRef = ref<HTMLIFrameElement>()

// 批准通过回调
function auditPassAjaxCallback(res: any) {
  if (res?.success) {
    message.success('操作成功')
    window.opener?.InitObj?.reloadDataGrid(false)
    showDialog.value = false
    props.onConfirm(null)
    setTimeout(() => {
      window.close()
    }, 1000)
  }
  else {
    message.error(res?.msg || '操作失败')
  }
}

// 挂在window上给iframe调用
window.InitObj = {
  auditPassAjaxCallback,
}

function handleOk() {
  iframeRef?.value?.contentWindow?.InitObj.openCallback()
}
</script>
