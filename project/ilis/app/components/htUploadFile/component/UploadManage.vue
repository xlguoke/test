<template>
  <a-spin :spinning="loading" wrapper-class-name="spin-wrapper">
    <div class="ht-upload-file-wrapper">
      <div class="file-warp">
        <div class="upload-card" style="flex: 1.5">
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
          <div v-if="isSearch" class="flex items-center mb-1">
            筛选条件：
            <div class="px-2 py-1 border border-gray-200 border-solid">
              上传人员: {{ isSearch.audience }}
              <CloseOutlined style="color:#f87171;cursor:pointer;" @click="clearQuery" />
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
        <div class="upload-card">
          <p class="upload-card-title">
            邀请管理
          </p>
          <div class="file-table">
            <InviteFileList
              :datas="inviteDatas"
              :qr-code-key="qrCodeKey"
              :qr-code-link="qrCodeLink"
              @load="getinviteDatas"
              @query-file="queryFile"
            />
          </div>
        </div>
      </div>
      <div class="upload-warp">
        <p style="line-height: 16px">
          <span style="color: red">*</span>
          允许上传的文件格式：{{ ACCEPT_STR }}，单个文件大小不超过500M
        </p>
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
            <div class="upload-qrcode">
              <img v-if="qrCodeImgUrl" :src="qrCodeImgUrl" class="w-full h-full block">
            </div>
            <p>扫描上方二维码上传手机文件或拍照上传</p>
            <a-button type="primary" @click="openInviteModal">
              邀请其它人员上传
            </a-button>
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
      </div>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
import type { InviteFileData, PropData } from '..'
import { AppstoreOutlined, CloseOutlined, UnorderedListOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import QrCode from 'qrcode'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useCommonUpload } from './commonUpload'
import { deleteQrFile, getHistoryFilesDatas, getInviteList, getQrFileDatas, initFileDatas } from './fileOperations'
import InviteSetting from './InviteSetting.vue'

/**
 * 1-按表格展示 2-按宫格展示
 */
type ArrangeType = 1 | 2

const props = defineProps<PropData>()

const emits = defineEmits(['loadData', 'getData'])

const { ACCEPT, ACCEPT_STR } = useCommonUpload({
  accept: props.accept,
})

let timer = null as any

const loading = defineModel('loading', {
  type: Boolean,
  default: false,
})

const loadFinish = ref(false)

const tableKey = ref('')

const arrangeType = ref<ArrangeType>(1)

const historyFileDatas = ref([] as any[])

const fileDatas = ref([] as any[])

/** 邀请上传的文件列表 */
const inviteDatas = ref([] as any[])

/** 主码key */
const qrCodeKey = ref('')

const qrCodeImgUrl = ref('')

/** 二维码链接地址 */
const qrCodeLink = ref('')

// 初始化数据
async function initDatas() {
  if (!props.businessType)
    return
  try {
    loading.value = true
    const res = await initFileDatas({
      businessId: props.businessId,
      businessType: props.businessType,
      recursion: props.recursion,
      parentKey: props.parentKey,
      dfQrCodeUrl: props.qrCodeUrl,
      forceInit: props.forceInit,
      order: props.order,
      orderBy: props.orderBy,
    })
    qrCodeLink.value = `${res.qrCodeUrl}&accepts=${encodeURIComponent(ACCEPT.value.join(','))}`
    qrCodeImgUrl.value = await QrCode.toDataURL(qrCodeLink.value, { margin: 2 })
    qrCodeKey.value = res.qrCodeKey
    fileDatas.value = res.fileDatas
    historyFileDatas.value = res.historyfileDatas
    await getinviteDatas()
    loadFinish.value = true
    cylicLoadFileDatas()
  }
  catch (err: any) {
    message.error(err.message)
  }
  loading.value = false
}

/**
 *  获取邀请列表
 */
async function getinviteDatas() {
  inviteDatas.value = await getInviteList(qrCodeKey.value)
}

/**
 * 筛选附件
 */
const isSearch = ref<InviteFileData>()
function queryFile(row: InviteFileData) {
  isSearch.value = row
  cylicLoadFileDatas()
}
function clearQuery() {
  isSearch.value = undefined
  cylicLoadFileDatas()
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
  if (!isSearch.value) {
    const files = await getQrFileDatas(qrCodeKey.value, props.recursion, props.orderBy, props.order)
    fileDatas.value = files.concat(historyFileDatas.value)
  }
  else {
    fileDatas.value = await getQrFileDatas(isSearch.value.qrKey, props.recursion, props.orderBy, props.order)
  }
  await getinviteDatas()
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

/**
 * 打开邀请设置弹窗
 */
async function openInviteModal() {
  await AnyDialogHelper.showModel(InviteSetting, {
    coreKey: qrCodeKey.value,
  })
  getinviteDatas()
}

watch(fileDatas, (list) => {
  if (isSearch.value)
    return
  emits('loadData', { files: list, qrCodeKey: qrCodeKey.value })
})

onMounted(async () => {
  initDatas()
})

onBeforeUnmount(() => {
  closeCylicLoad()
})
</script>

<style lang="less" scoped>
@import './uploadManage.less';
</style>
