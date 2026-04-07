<template>
  <div class="ht-upload-file">
    <slot v-if="!isReandonly" :open-fun="openUpload">
      <a-button @click="openUpload">
        <template #icon>
          <UploadOutlined />
        </template>
        点击上传
      </a-button>
    </slot>
    <div v-if="!hideFileList" class="preview-list">
      <slot name="preview-list" :data="fileDatas">
        <AttachmentList
          v-if="isReandonly || fileDatas.length > 0" :datas="fileDatas"
          :pdf-preview-handler="props.pdfPreviewHandler"
        />
      </slot>
    </div>

    <UploadModal
      v-if="!isReandonly"
      v-model="visible"
      destroy-on-close
      hide-ok-btn
      @change-full="changeFull"
      @cancel="cancelUpload"
    >
      <UploadManage
        ref="uploadManage"
        :key="uploadKey"
        v-model:loading="loading"
        :qr-code-url="qrCodeUrl"
        :business-id="businessId"
        :business-type="businessType"
        :recursion="recursion"
        :parent-key="parentKey"
        :hide-file-list="hideFileList"
        :force-init="forceInit"
        :accept="accept"
        :order="order"
        :order-by="orderBy"
        @load-data="loadFileData"
      />
      <template #footer="{ handleCancel, handleSubmit }">
        <slot
          name="footer"
          :handle-cancel="handleCancel"
          :handle-submit="handleSubmit"
          :file-datas="fileDatas"
        />
      </template>
    </UploadModal>
  </div>
</template>

<script lang='ts' setup>
import type { PropData } from '.'
import { UploadOutlined } from '@ant-design/icons-vue'
import { AttachmentList } from '~/components/attachmentList'
import { initFileDatas } from './component/fileOperations'
import UploadManage from './component/UploadManage.vue'

const props = defineProps<PropData>()

const emits = defineEmits(['getData', 'getQrCodeKey', 'initComplete', 'cancel'])

const uploadManage = ref()

let timer = 0 as any

const visible = ref(false)

const loadFinish = ref(false)

const qrCodeUrl = ref(props.qrCodeUrl)

const qrCodeKey = ref('')

const fileDatas = ref([] as any[])

const uploadKey = ref(Date.now())

const loading = defineModel('loading', {
  type: Boolean,
  default: false,
})

watch(() => qrCodeKey.value, (val) => {
  emits('getQrCodeKey', val)
})

async function openUpload() {
  if (props.forceInit) {
    qrCodeKey.value = ''
    qrCodeUrl.value = ''
    fileDatas.value = []
    uploadKey.value = Date.now()
    await init()
  }
  nextTick(() => {
    visible.value = true
    pushParentFiles()
  })
}

function cancelUpload() {
  clearTimeout(timer)
  // 关闭弹窗时更新一次数据，避免由于定时器延迟无法获取最新数据
  emits('getData', {
    qrCodeUrl: qrCodeUrl.value,
    qrCodeKey: qrCodeKey.value,
    fileDatas: fileDatas.value,
  })
  visible.value = false
  emits('cancel')
}

/**
 * 切换全屏，刷新附件列表，重新计算内容区高度
 */
function changeFull() {
  if (!uploadManage.value)
    return
  uploadManage.value.tableKey = Date.now()
}

/**
 * 获取附件信息
 * @param fileInfo
 */
function loadFileData(fileInfo: any) {
  fileDatas.value = fileInfo.files
  qrCodeKey.value = fileInfo.qrCodeKey
  loadFinish.value = true
}

// 更新父组件数据
function pushParentFiles() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    emits('getData', {
      qrCodeUrl: qrCodeUrl.value,
      qrCodeKey: qrCodeKey.value,
      fileDatas: fileDatas.value,
    })
    pushParentFiles()
  }, 1000)
}

async function init() {
  loading.value = true
  const { fileDatas: _fileDatas, qrCodeUrl: _qrCodeUrl, qrCodeKey: _qrCodeKey } = await initFileDatas({
    businessId: props.businessId,
    businessType: props.businessType,
    recursion: props.recursion,
    parentKey: props.parentKey,
    dfQrCodeUrl: qrCodeUrl.value,
    forceInit: props.forceInit,
    orderBy: props.orderBy,
    order: props.order,
  }).finally(() => {
    loading.value = false
  })
  qrCodeUrl.value = _qrCodeUrl
  qrCodeKey.value = _qrCodeKey
  fileDatas.value = _fileDatas
  loadFinish.value = true
  emits('initComplete', {
    qrCodeUrl: _qrCodeUrl,
    qrCodeKey: _qrCodeKey,
    fileDatas: _fileDatas,
  })
}

watch(() => props.businessType, (type) => {
  if (!type)
    return
  init()
}, {
  immediate: true,
})

watch(fileDatas, (val) => {
  emits('getData', {
    qrCodeUrl: qrCodeUrl.value,
    qrCodeKey: qrCodeKey.value,
    fileDatas: val,
  })
}, {
  immediate: true,
  deep: true,
})

defineExpose({
  init,
  fileDatas,
})
</script>

<style lang="less" scoped>
.ht-upload-file {
  display: inline-flex;
  :deep(.ant-btn)  {
    display: flex;
    align-items: center;
  }
  .preview-list {
    margin-left: 8px;
    width: 100%;
    .preview-item {
      color: var(--colorPrimary);
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
.preview-img {
  margin: auto;
  display: block;
  max-width: 100%;
  max-height: 100%;
}
</style>
