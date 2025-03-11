<template>
  <div>
    <BaseTitle class="mt-6 mb-4">
      签字二维码
      <template #right>
        <a-button
          size="small"
          class="mt-1"
          :disabled="!qrCode || disabledDownload"
          @click="downloadQrCode"
        >
          下载二维码
        </a-button>
      </template>
    </BaseTitle>
    <div class="qrImg flex items-center">
      <div class="bg-[#e6f4ff] p-1 mr-4 w-[120px] h-[120px] rounded-[2px]">
        <img class="w-full h-full block" :src="qrCode" alt="">
      </div>
      <a-alert class="flex-1 text-xs rounded-[4px] leading-[20px]">
        <template #message>
          <p>使用方法：</p>
          <p>1、请使用微信、QQ或浏览器扫一扫功能扫描二维码；</p>
          <p>2、输入手机号后四位通过验证；</p>
          <p>3、查看待签字列表，左滑可查看{{ source === SIGNATURE_SOURCE.CONSIGN ? '委托单' : '报告' }}详情；</p>
          <p>4、选择您想要{{ source === SIGNATURE_SOURCE.CONSIGN ? '签字的委托' : '领取的报告' }}，点击“签名”；签名完成后，提交即可；</p>
        </template>
      </a-alert>
    </div>
    <!-- 下载二维码样式：下载的二维码样式有差异，将html复制出来调整，然后下载复制后的html -->
    <div id="qrImgBox" class="w-[70%] qr-img-box"></div>
  </div>
</template>

<script setup lang='ts'>
import html2canvas from 'html2canvas'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { SIGNATURE_SOURCE } from '..'
import { consignQrcodeByPhone, reportQrcodeByPhone } from '../api'

interface Props {
  source?: SIGNATURE_SOURCE
  phone: string
}

const props = defineProps<Props>()

const qrCodelink = ref('')
const qrCode = useQRCode(qrCodelink, { size: 200, margin: 2 })

// 切换手机号时，更新二维码链接
watch(() => props.phone, (val) => {
  if (!val)
    return ''
  getRrCodeUrl()
}, {
  immediate: true,
})

// 获取二维码链接
async function getRrCodeUrl() {
  if (props.source === SIGNATURE_SOURCE.CONSIGN) {
    const { data } = await consignQrcodeByPhone(props.phone)
    qrCodelink.value = data
  }
  else if (props.source === SIGNATURE_SOURCE.REPORT) {
    const { data } = await reportQrcodeByPhone(props.phone)
    qrCodelink.value = data
  }
}

// 下载
const disabledDownload = ref(false)
async function downloadQrCode() {
  if (disabledDownload.value)
    return

  disabledDownload.value = true
  try {
    const qrImg = document.querySelector('.qrImg') as HTMLElement
    const qrImgBox = document.querySelector('#qrImgBox') as HTMLElement
    qrImgBox.innerHTML = qrImg.outerHTML
    const qrImg2 = qrImgBox.querySelector('.qrImg') as HTMLElement
    const canvas = await html2canvas(qrImg2)
    const base64Url = canvas.toDataURL()
    const link = document.createElement('a')
    const body = document.querySelector('body')
    if (body) {
      link.href = base64Url
      link.download = '签字二维码.png'

      link.style.display = 'none'
      body.appendChild(link)

      link.click()
      body.removeChild(link)
    }
    else {
      throw new Error('未找到body节点')
    }
  }
  catch (err) {
    console.error(err)
  }
  setTimeout(() => {
    disabledDownload.value = false
  }, 3000)
}
</script>

<style scoped>
.qr-img-box{
  position: fixed;
  left: -9999999px;
  opacity: 0;
}
.qr-img-box .qr-img{
  opacity: 1;
}
.qr-img-box .ant-alert{
  padding-top: 2px;
  padding-bottom: 14px;
}
p{
  margin-bottom: 0;
}
</style>
