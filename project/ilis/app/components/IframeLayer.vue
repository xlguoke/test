<template>
  <ht-modal
    v-model:open="visible"
    :title="title"
    :width="width"
    fixed-height
    :after-close="onClosed"
    :hide-confirm="param.hideConfirm"
    :full-screen="param.fullScreen"
    @cancel="onClosed"
    @ok="handleConfirm"
  >
    <div class="h-full">
      <iframe v-if="url" ref="iframeRef" class="w-full h-full" :src="url" frameborder="0"></iframe>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

export type ConfirmResult = {
  /** iframe 窗口window对象：具体获取数据逻辑在业务中自行实现 */
  iframeWindow: Window
  /** 关闭弹窗 */
  close: () => void
} | null

export interface PropParam {
  title: string
  url: string
  width?: string
  hideConfirm?: boolean
  fullScreen?: boolean
  onConfirm?: (param: ConfirmResult) => void
}

const props = defineProps<IDialogPropsParam<ConfirmResult, PropParam>>()

const title = ref(props.param.title)

const width = computed(() => props.param.width || '90%')

const url = ref(props.param.url)

const visible = ref(true)

const iframeRef = ref<HTMLIFrameElement | null>(null)

window.iframeLayer = {
  refresh: (_url: string, _title?: string) => {
    url.value = _url
    if (_title) {
      title.value = _title
    }
  },
  close: () => {
    visible.value = false
  },
}

function onClosed() {
  visible.value = false
  if (props.param.onConfirm)
    props.param.onConfirm(null)
  else
    props.onConfirm(null)
}

function handleConfirm() {
  const win = iframeRef.value?.contentWindow
  if (!win) {
    console.error('iframe 窗口window对象为空')
    return
  }

  // 需在弹窗外部控制关闭，需自定义确定事件，默认确认事件执行时必须关闭弹窗（promise已执行结束）
  if (props.param.onConfirm) {
    props.param.onConfirm({
      iframeWindow: win,
      close: onClosed,
    })
    return
  }

  props.onConfirm({
    iframeWindow: win,
    close: onClosed,
  })
  onClosed()
}
</script>

<style>

</style>
