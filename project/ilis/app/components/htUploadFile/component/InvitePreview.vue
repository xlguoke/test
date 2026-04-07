<template>
  <ht-modal
    v-model:open="visible"
    :title="param.data.audience"
    width="450px"
    :after-close="onClosed"
    :confirm-loading="loading"
    cancel-text="关闭"
    ok-text="下载"
    @ok="downloadQrImg"
  >
    <div ref="qrCodeRef">
      <a-flex align="center" :gap="10" class="py-3">
        <div class="p-1 w-[120px] h-[120px] bg-[#d9ebff]">
          <img v-if="qrCodeUrl" :src="qrCodeUrl" class="w-full h-full block">
        </div>
        <ul class="m-0 flex-1 w-0">
          <li>
            <span class="text-gray-500">创建人：</span>
            {{ param.data.createName }}
          </li>
          <li>
            <span class="text-gray-500">创建日期：</span>
            {{ param.data.createDate }}
          </li>
          <li>
            <span class="text-gray-500">有效截止日期：</span>
            {{ param.data.invalidTime }}
          </li>
          <li>
            <span class="text-gray-500">分享对象：</span>
            {{ param.data.audience }}
          </li>
          <li>
            <span class="text-gray-500">使用方法：</span>
            使用微信、QQ或浏览器的扫码功能扫描二维码进入附件上传页面
          </li>
        </ul>
      </a-flex>
    </div>
    <a-alert
      message="请注意上传的文件格式和数量有限制，详情请查看上传页面"
      type="info"
      show-icon
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { InviteFileData } from '..'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import html2canvas from 'html2canvas'
import QrCode from 'qrcode'

interface Param {
  data: InviteFileData
  qrCodeLink: string
}

const props = defineProps<IDialogPropsParam<string, Param>>()

const visible = ref(true)
const loading = ref(false)
const qrCodeUrl = ref('')
const qrCodeRef = ref()

watch(
  () => props.param.data.qrKey,
  async (qrKey) => {
    if (!qrKey)
      return
    qrCodeUrl.value = await QrCode.toDataURL(`${props.param.qrCodeLink}&inviteKey=${qrKey}`, { margin: 2 })
  },
  {
    immediate: true,
  },
)

// 下载
async function downloadQrImg() {
  loading.value = true
  const canvas = await html2canvas(qrCodeRef.value)
  const base64Url = canvas.toDataURL()
  const link = document.createElement('a')
  const body = document.querySelector('body')
  if (body) {
    link.href = base64Url
    link.download = '邀请上传二维码.png'

    link.style.display = 'none'
    body.appendChild(link)

    link.click()
    body.removeChild(link)
  }
  else {
    throw new Error('未找到body节点')
  }
  loading.value = false
}
</script>
