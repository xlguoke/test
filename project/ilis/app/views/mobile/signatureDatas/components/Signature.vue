<template>
  <van-popup v-model:show="visible" position="bottom" :close-on-click-overlay="false">
    <div class="relative h-[80vh] flex flex-col">
      <van-nav-bar title="签字" />
      <div class="flex-1 h-0 overflow-auto relative">
        <!-- 默认显示上次的签字图片 -->
        <div class="m-2 p-2 h-[200px] rounded-lg border border-dashed" @click="signKey++;signVisible = true">
          <img
            v-if="base64Img || historySignUrl"
            :src="base64Img || historySignUrl"
            class="w-full h-full object-contain"
          >
        </div>

        <div class="px-2 mt-[-4px] flex justify-between items-center text-xs text-gray-400">
          点击虚线区域签字
        </div>

        <!-- 附件信息：存在见证人签名时显示 -->
        <div v-if="isAttachments" class="p-2 mt-2">
          <div class="mb-2 text-xs text-gray-400">
            当前所签委托单中含见证人签名，您可以上传身份信息附件：
          </div>
          <UploadFile :file-list="fileList" @change="changeFileList" />
        </div>
      </div>

      <div class="p-2 flex gap-2">
        <van-button block size="small" @click="visible = false">
          取 消
        </van-button>
        <van-button block size="small" type="primary" @click="handleSubmit">
          确 定
        </van-button>
      </div>
    </div>

    <!-- 签字板 -->
    <van-overlay :show="signVisible">
      <Sign :key="signKey" @close="signVisible = false" @save="onSubmit" />
    </van-overlay>
  </van-popup>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { SIGNATURE_SOURCE } from '~/components/onlineSignature'
import { fileUploadNoLogin, getLastReportSignPhoto, getLastSignAttachments, getLastSignPhoto } from '../api'
import Sign from './Sign.vue'
import UploadFile from './UploadFile.vue'

export interface SignFiles {
  id: string
  url: string
  name?: string
}

export interface EmitEvent {
  signUrl: string
  attachments: SignFiles[]
}

const props = defineProps({
  show: Boolean,
  signSource: {
    type: String as PropType<SIGNATURE_SOURCE>,
    default: '',
  },
  /** 是否需要上传附件 */
  isAttachments: Boolean,
  /** 加密后的手机号 */
  encodePhone: {
    type: String,
    default: '',
  },
  /** 选中的数据 */
  selectedRows: Array,
})

const emits = defineEmits<{
  (e: 'submit', val: EmitEvent): void
  (e: 'update:show', val: boolean): void
}>()

const visible = ref(false)
// 附件列表
const fileList = ref<SignFiles[]>([])
// 历史签名图片地址
const historySignUrl = ref('')
let base64Img = ''
const signVisible = ref(false)
const signKey = ref(1)

// 监听签名弹窗显示/隐藏，初始化签名页面
watch(() => props.show, (val) => {
  base64Img = ''
  visible.value = val
  if (!val)
    return

  initSignaturePage()
})
watch(() => visible.value, (val) => {
  if (val)
    return
  emits('update:show', false)
})

async function initSignaturePage() {
  if (props.selectedRows) {
    const row: any = props.selectedRows[0]
    historySignUrl.value = row.signUrl
  }
  // 委托签字最后上传的信息
  else if (props.signSource === SIGNATURE_SOURCE.CONSIGN) {
    getLastConsignSignInfo()
  }
  else if (props.signSource === SIGNATURE_SOURCE.REPORT) {
    // 报告签字最后上传的信息
    getLastReportSignInfo()
  }
}

/**
 * 获取委托最后的签字图片和附件
 */
async function getLastConsignSignInfo() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  try {
    const { data } = await getLastSignPhoto(props.encodePhone)
    historySignUrl.value = data || ''
    if (props.isAttachments) {
      const { data } = await getLastSignAttachments(props.encodePhone)
      fileList.value = data.map(d => ({
        id: d.attachmentId,
        url: d.url,
        name: d.name,
      }))
    }
  }
  catch (err) {
    console.error(err)
  }
  closeToast()
}

async function getLastReportSignInfo() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  try {
    const { data } = await getLastReportSignPhoto(props.encodePhone)
    historySignUrl.value = data || ''
  }
  catch (err) {
    console.error(err)
  }
  closeToast()
}

// 上传附件
function changeFileList(files: SignFiles[]) {
  fileList.value = files
}

// 提交签名信息
function handleSubmit() {
  if (historySignUrl.value) {
    emits('submit', {
      signUrl: historySignUrl.value,
      attachments: fileList.value,
    })
  }
  else {
    onSubmit()
  }
}

async function onSubmit(image?: string) {
  if (!image && !base64Img) {
    showNotify({ type: 'warning', message: '请在虚线区域内签字后再提交！' })
    return ''
  }
  try {
    if (image) {
      historySignUrl.value = ''
      base64Img = image
    }
    signVisible.value = false
    showLoadingToast({
      forbidClick: true,
      duration: 0,
    })
    const { data } = await fileUploadNoLogin(base64Img, `${Date.now()}.png`)
    if (data.code === 21000) {
      historySignUrl.value = data.data[0].realpath
      base64Img = ''
    }
    else {
      showNotify({ type: 'danger', message: '图片上传失败，请重新尝试！' })
    }
    closeToast()
  }
  catch (err) {
    console.error(err)
    closeToast()
    return ''
  }
}
</script>
