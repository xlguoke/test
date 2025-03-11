<template>
  <a-spin :spinning="loading" wrapper-class-name="spin-wrapper">
    <div class="ht-upload-file-wrapper">
      <div class="file-warp">
        <div class="upload-card">
          <div class="upload-card-title">
            附件列表
            <div class="arrange-icon">
              <UnorderedListOutlined
                :class="arrangeType === 1 ? 'active' : ''"
                @click="arrangeType = 1"
              />
              <AppstoreOutlined
                :class="arrangeType === 2 ? 'active' : ''"
                @click="arrangeType = 2"
              />
            </div>
          </div>
          <div class="file-table">
            <FileList
              :key="tableKey"
              :datas="fileDatas"
              :business-type="businessType"
              :recursion="recursion"
              :arrange-type="arrangeType"
              :accept="accept"
              @delete="deleteFile"
            />
          </div>
        </div>
      </div>
      <div class="upload-warp">
        <div class="upload-card">
          <p class="upload-card-title">
            本地上传
          </p>
          <UploadDragger :qr-code-key="qrCodeKey" :accept="accept" @load="cylicLoadFileDatas" />
        </div>
        <div class="upload-card">
          <p class="upload-card-title">
            扫码上传
          </p>
          <div class="upload-card-content">
            <div ref="qrcodeImg" class="upload-qrcode" />
            <p>扫描上方二维码上传手机文件或拍照上传</p>
            <!-- <a-button type="primary">邀请其它人员上传</a-button> -->
          </div>
        </div>
        <div class="upload-card">
          <p class="upload-card-title">
            高拍仪扫描上传
          </p>
          <UploadGaoPaiYi
            :qr-code-key="qrCodeKey"
            :business-type="businessType"
            :accept="accept"
            @load="cylicLoadFileDatas"
          />
        </div>
        <p style="line-height: 16px">
          <span style="color: red">*</span>
          允许上传的文件格式：{{ ACCEPT_STR }}，单个文件大小不超过500M
        </p>
      </div>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import {
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue'
import { useCommonUpload } from './commonUpload'
import { deleteQrFile, getHistoryFilesDatas, getQrFileDatas, initFileDatas } from './fileOperations'
/**
 * 1-按表格展示 2-按宫格展示
 */
type ArrangeType = 1 | 2

const props = defineProps<{
  businessId?: string // 业务id
  qrCodeUrl: string // 主码路径
  businessType: string // 业务类型
  parentKey?: string // 业务类型
  recursion?: boolean // 递归查询当前二维码下所有的二维码的附件
  hideFileList?: boolean // 隐藏文件列表
  forceInit?: boolean // 是否强制初始化(传入此参数时，每次打开组件都是全新数据)
  accept?: string[] // 接受上传的文件类型
}>()

const emits = defineEmits(['loadData', 'getData'])

const { ACCEPT_STR, createScript } = useCommonUpload({
  accept: props.accept,
})

let timer = null as any

const loading = ref(false)

const loadFinish = ref(false)

const tableKey = ref('')

const arrangeType = ref<ArrangeType>(1)

const historyFileDatas = ref([] as any[])

const fileDatas = ref([] as any[])

const qrCodeKey = ref('') // 主码key

const qrcodeImg = ref()

watch(fileDatas, (list) => {
  emits('loadData', { files: list, qrCodeKey: qrCodeKey.value })
})

async function initDatas() {
  if (!props.businessType)
    return
  try {
    loading.value = true
    const { qrCodeUrl: _qrCodeUrl, qrCodeKey: _qrCodeKey, fileDatas: _fileDatas, historyfileDatas: _historyfileDatas } = await initFileDatas({
      businessId: props.businessId,
      businessType: props.businessType,
      recursion: props.recursion,
      parentKey: props.parentKey,
      dfQrCodeUrl: props.qrCodeUrl,
      forceInit: props.forceInit,
    })
    const qrcode = new window.QRCode(qrcodeImg.value)
    let accepts = ''
    if (props.accept?.length) {
      accepts = `&accepts=${props.accept.join(',')}`
    }
    qrcode.makeCode(_qrCodeUrl + accepts)
    qrCodeKey.value = _qrCodeKey
    fileDatas.value = _fileDatas
    historyFileDatas.value = _historyfileDatas
    loadFinish.value = true
    cylicLoadFileDatas()
  }
  catch (err: any) {
    message.error(err.message)
  }
  loading.value = false
}

/**
 * 关闭定时器
 */
function closeCylicLoad() {
  clearTimeout(timer)
}

/**
 * 定时刷新列表
 */
async function cylicLoadFileDatas() {
  closeCylicLoad()
  const files = await getQrFileDatas(qrCodeKey.value, props.recursion)
  fileDatas.value = files.concat(historyFileDatas.value)
  timer = setTimeout(() => {
    cylicLoadFileDatas()
  }, 3000)
}

/**
 * 删除附件
 * @param file
 */
async function deleteFile(file: any) {
  try {
    loading.value = true
    await deleteQrFile(file, qrCodeKey.value, props.businessType as string)
    message.success('删除成功')
    if (file.historical) {
      historyFileDatas.value = await getHistoryFilesDatas(props.businessId as string, props.businessType as string)
    }
    cylicLoadFileDatas()
  }
  catch (err: any) {
    message.error(err.msg || err.message || '删除失败')
  }
  loading.value = false
}

onMounted(async () => {
  await createScript('qrcode.min.js')
  initDatas()
})

onBeforeUnmount(() => {
  sessionStorage.removeItem(`isIframeOpen-${props.businessType}`)
  closeCylicLoad()
})
</script>

<style lang="less" scoped>
.spin-wrapper{
  height: 100%;
  :deep(.ant-spin-container){
    height: 100%;
  }
}
:deep(.ant-table-row) {
  &:nth-child(2n){
    background-color: #fafafa;
  }
}
.ant-btn-link {
  padding: 0 4px;
}
.ht-upload-file-wrapper {
  display: flex;
  height: 100%;
  overflow: hidden;
}
.file-warp {
  flex: 1;
  height: 100%;
  width: 0;
  display: flex;
  flex-direction: column;
  .file-search {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    .search-item {
      display: inline-block;
      padding: 6px 8px;
      margin-left: 4px;
      border: 1px solid #dcdcdc;
      border-radius: 2px;
      line-height: 12px;
      .anticon {
        margin-left: 10px;
        color: #fa462f;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
  .upload-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 0;

    .file-table {
      flex: 1;
      height: 0;
    }
    &:not(:last-child) {
      margin-bottom: 12px;
    }
    .upload-card-title {
      margin-bottom: 8px;
      font-size: 16px;
      &::before {
        content: "";
        display: inline-block;
        margin-right: 8px;
        vertical-align: middle;
        width: 4px;
        height: 18px;
        background-color: #0066ec;
        border-radius: 0 4px 4px 0;
      }
    }
  }
}
.upload-warp {
  margin-left: 16px;
  padding-left: 14px;
  width: 340px;
  border-left: 1px solid #dcdcdc;
  overflow-y: auto;
  .upload-card {
    padding: 8px 12px;
    margin-bottom: 4px;
    background-color: #f7f8fa;
    border-radius: 4px;
    .upload-card-content {
      padding-bottom: 8px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      text-align: center;
      .ant-btn {
        margin-top: 6px;
        width: 80%;
      }
    }
  }
  .upload-qrcode {
    padding: 4px;
    margin: 8px auto;
    width: 110px;
    height: 110px;
    border: 1px solid #eee;
    background-color: #fff;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}

.upload-card {
  .upload-card-title {
    margin-bottom: 8px;
    font-size: 16px;
    &::before {
      content: "";
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
      width: 4px;
      height: 18px;
      background-color: #0066ec;
      border-radius: 0 4px 4px 0;
    }
    .arrange-icon {
      float: right;
      .anticon {
        margin-left: 8px;
        font-size: 18px;
        color: #aaa;
        cursor: pointer;
        &.active,
        &:hover {
          color: #0066ec;
        }
      }
    }
  }
}
</style>
