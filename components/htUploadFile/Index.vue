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
    <ul v-if="!hideFileList" class="preview-list">
      <li
        v-for="d in fileDatas"
        :key="d.id"
        :title="tipTitle(d.format)"
        class="preview-item"
        @click="previewFile(d)"
      >
        {{ d?.name }}
      </li>
    </ul>

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
        :key="uplaodKey"
        :qr-code-url="qrCodeUrl"
        :business-id="businessId"
        :business-type="businessType"
        :recursion="recursion"
        :parent-key="parentKey"
        :hide-file-list="hideFileList"
        :force-init="forceInit"
        :accept="accept"
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
import { UploadOutlined } from '@ant-design/icons-vue'
import { useCommonUpload } from './component/commonUpload'
import { downloadQrFile, initFileDatas } from './component/fileOperations'
import UploadManage from './component/UploadManage.vue'

const props = defineProps<{
  businessId?: string // 业务id
  businessType: string // 业务类型： CONSIGN-委托 SAMPLE-样品
  parentKey?: string // 父级附件的二维码key
  recursion?: boolean // 递归查询当前二维码下所有的二维码的附件
  hideFileList?: boolean // 隐藏文件列表
  isReandonly?: boolean // 只读模式
  forceInit?: boolean // 是否强制初始化(传入此参数时，每次打开组件都是全新数据)
  accept?: string[] // 接受上传的文件类型
  // limit?: number // 限制上传文件数量
}>()

const emits = defineEmits(['getData', 'getQrCodeKey'])

const {
  IS_IMAGE,
  IS_PDF,
} = useCommonUpload({ accept: props.accept })

const uploadManage = ref()

let timer = 0 as any

const visible = ref(false)

const loadFinish = ref(false)

const qrCodeUrl = ref('')

const qrCodeKey = ref('')

const fileDatas = ref([] as any[])

const uplaodKey = ref(Date.now())

async function openUpload() {
  if (props.forceInit) {
    qrCodeKey.value = ''
    qrCodeUrl.value = ''
    fileDatas.value = []
    uplaodKey.value = Date.now()
    await init()
  }
  nextTick(() => {
    visible.value = true
    pushParentFiles()
  })
}

function cancelUpload() {
  clearTimeout(timer)
  visible.value = false
}

function tipTitle(type: string) {
  return IS_IMAGE(type) || IS_PDF(type) ? '点击预览' : '点击下载'
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

function previewFile(file: any) {
  if (IS_IMAGE(file.format) || IS_PDF(file.format)) {
    window.open(file.url, '_blank')
  }
  else {
    downloadQrFile(file)
  }
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
  const { fileDatas: _fileDatas, qrCodeUrl: _qrCodeUrl, qrCodeKey: _qrCodeKey } = await initFileDatas({
    businessId: props.businessId,
    businessType: props.businessType,
    recursion: props.recursion,
    parentKey: props.parentKey,
    dfQrCodeUrl: qrCodeUrl.value,
    forceInit: props.forceInit,
  })
  emits('getQrCodeKey', _qrCodeKey)
  qrCodeUrl.value = _qrCodeUrl
  qrCodeKey.value = _qrCodeKey
  fileDatas.value = _fileDatas
  loadFinish.value = true
}

onMounted(async () => {
  init()
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
    .preview-item {
      color: #0066ec;
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
