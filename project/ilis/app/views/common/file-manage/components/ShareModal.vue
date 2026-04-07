<template>
  <HtModal
    v-model:open="showDialog"
    title="分享二维码"
    :after-close="onClosed"
    width="260px"
    ok-text="下载"
    @ok="onOk"
  >
    <div class="flex flex-col justify-center items-center">
      <a-checkbox v-model:checked="allowDownload" v-permission="['fileManageShareDownloadControll']">
        分享文件允许下载
      </a-checkbox>
      <div class="my-[12px]">
        <a-qrcode ref="qrcodeCanvasRef" :value="renderQrcode" />
      </div>
      <div>文件二维码可下载分享</div>
    </div>
  </HtModal>
</template>

<script setup lang='ts'>
import type { FolderTree } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { generateShareQrcode } from '../api'

const props = defineProps<IDialogPropsParam<any, FolderTree>>()

const showDialog = ref(true)

const qrcode = ref('')

const allowDownload = ref(false)

const renderQrcode = computed(() => {
  return `${qrcode.value}?allowDownload=${allowDownload.value}`
})

const qrcodeCanvasRef = ref<HTMLCanvasElement>()

async function getShareQrcode() {
  const { data } = await generateShareQrcode(props.param.id)
  qrcode.value = data || ''
}

async function onOk() {
  if (!qrcodeCanvasRef.value)
    return
  const url = await qrcodeCanvasRef.value.toDataURL()
  const a = document.createElement('a')
  a.download = 'qrCode.jpg'
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

getShareQrcode()
</script>
