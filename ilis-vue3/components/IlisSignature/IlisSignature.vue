<template>
  <ht-modal
    v-model:open="visible"
    :title="param?.title || '签字'"
    width="300px"
    :confirm-loading="loading"
    :after-close="onClosed"
    ok-text="签字确认"
    @ok="handleOk()"
  >
    <div class="flex flex-col gap-3 items-center">
      <img :src="qrcode" alt="QR Code" />
      <a-button :icon="h(CopyOutlined)" @click="handleCopy">
        复制链接
      </a-button>
      <div>
        可通过二维码或链接分享完成签字确认
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import DoSignModal from './DoSignModal.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

interface ISelectModalProps {
  /** # 标题 */
  title?: string
  /** # 默认值 */
  value: any
}

const props = defineProps<IDialogPropsParam<any, ISelectModalProps>>()

const visible = ref(true)

const loading = ref(false)

const value = ref(props.param.value)

const qrcode = useQRCode(value)

const { copy } = useClipboard()

function handleCopy() {
  copy(value.value)
  message.success('复制成功')
}

async function handleOk() {
  const res = await AnyDialogHelper.showModel(DoSignModal)
  if (res) {
    props.onConfirm(res)
    visible.value = false
  }
}
</script>
