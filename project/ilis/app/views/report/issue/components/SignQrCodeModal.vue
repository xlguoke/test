<template>
  <HtModal
    v-model:open="visible"
    title="签字二维码"
    width="350px"
    :loading="loading"
    :after-close="onClosed"
  >
    <div class="flex flex-col gap-4 mt-2 items-center">
      <a-qrcode
        ref="qrcodeCanvasRef"
        :size="220"
        :value="qrCodeUrl"
        color="#000"
        bg-color="#fff"
      />
      <a-alert type="info">
        <template #description>
          <p class="mb-1">
            使用方法
          </p>
          <p class="mb-1">
            1.请使用微信、QQ或浏览器扫一扫功扫描二维码；
          </p>
          <p class="mb-1">
            2.输入手机号后四位通过验证；
          </p>
          <p class="mb-1">
            3.查看待签字列表，左滑可查看报告详情；
          </p>
          <p class="mb-1">
            4.选择您想要领取的报告，点击“签名”；签名完成后，提交即可；
          </p>
        </template>
      </a-alert>
    </div>

    <template #footer>
      <a-button :disabled="!qrCodeUrl" type="primary" @click="onDownload">
        下载二维码
      </a-button>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getSignQrCode } from '~/views/report/issue/api.ts'

const props = defineProps<IDialogPropsParam<null, {
  phone: string
  reportIds: string[]
}>>()

const qrcodeCanvasRef = ref<any>()

const loading = ref(true)

const visible = ref(true)

const phone = computed(() => props.param.phone)

const reportIds = computed(() => (props.param.reportIds || []).join(','))

const qrCodeUrl = ref('')

getSignQrCode(phone.value, reportIds.value).then((res) => {
  qrCodeUrl.value = res.data
}).finally(() => {
  loading.value = false
})

async function onDownload() {
  const url = await qrcodeCanvasRef.value.toDataURL()
  downloader.excute(url, '签字二维码.png')
}
</script>
