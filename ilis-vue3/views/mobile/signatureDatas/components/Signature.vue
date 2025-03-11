<template>
  <van-popup v-model:show="visible" position="bottom" :close-on-click-overlay="false" @closed="onClear">
    <div class="relative h-[80vh] flex flex-col">
      <van-nav-bar title="签字" />
      <div class="flex-1 h-0 overflow-auto relative">
        <!-- 默认显示上次的签字图片 -->
        <div v-if="historySignUrl" class="p-2">
          <img :src="historySignUrl" alt="" class="w-full h-[200px] object-contain rounded-lg border border-dashed">
          <div class="text-right mt-1">
            <van-button type="primary" size="small" @click="historySignUrl = ''">
              重新签字
            </van-button>
          </div>
        </div>

        <!-- 重新签字 -->
        <template v-else>
          <van-signature ref="signatureRef" @submit="onSubmit" />
          <div class="px-2 mt-[-4px] flex justify-between items-center text-xs text-gray-300">
            请在虚线区域内签字
            <van-button size="small" class="w-[60px]" @click="onClear">
              清 空
            </van-button>
          </div>
        </template>

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
      <van-loading v-if="loading" color="#0066ec" size="24px" class="!absolute top-[46%] left-[50%] mr-[12px]" />
    </div>
    <van-overlay :show="loading" z-index="1000" :custom-style="{ background: 'transparent' }" />
  </van-popup>
</template>

<script setup lang='ts'>
import { showNotify } from 'vant'
import type { PropType } from 'vue'
import { fileUploadNoLogin, getLastReportSignPhoto, getLastSignAttachments, getLastSignPhoto } from '../api'
import UploadFile from './UploadFile.vue'
import { base64ToFile } from '~/utils/base64ToFile'
import { SIGNATURE_SOURCE } from '~/components/onlineSignature'

interface SignatureData {
  image: string
  canvas: HTMLCanvasElement
}

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

const loading = ref(false)
const visible = ref(false)
// 附件列表
const fileList = ref<SignFiles[]>([])
// 历史签名图片地址
const historySignUrl = ref('')

// 监听签名弹窗显示/隐藏，初始化签名页面
const signatureRef = ref()
watch(() => props.show, (val) => {
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
  onClear()

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
  loading.value = true
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
  loading.value = false
}

async function getLastReportSignInfo() {
  loading.value = true
  try {
    const { data } = await getLastReportSignPhoto(props.encodePhone)
    historySignUrl.value = data || ''
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
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
    signatureRef.value.submit()
  }
}
async function onSubmit(signRes: SignatureData) {
  if (!signRes.image) {
    showNotify({ type: 'warning', message: '请在虚线区域内签字后再提交！' })
    return ''
  }
  try {
    loading.value = true
    const file = base64ToFile(signRes.image)
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await fileUploadNoLogin(formData)
    if (data.code === 21000) {
      historySignUrl.value = data.data[0].realpath
      nextTick(() => {
        emits('submit', {
          signUrl: data.data[0].realpath,
          attachments: fileList.value,
        })
      })
    }
    else {
      showNotify({ type: 'danger', message: '图片上传失败，请重新尝试！' })
    }
    loading.value = false
  }
  catch (err) {
    console.error(err)
    loading.value = false
    return ''
  }
}

function onClear() {
  signatureRef.value?.clear()
}
</script>

<style scoped>
:deep(.van-signature__footer){
  display: none;
}
</style>
