<template>
  <!-- <van-nav-bar title="文件分享" /> -->
  <div v-if="allowDownload" class="px-4 pt-4 flex items-center gap-4">
    <van-checkbox
      v-model="isCheckAll"
      :indeterminate="isIndeterminate"
      @change="checkAllChange"
    >
      全选
    </van-checkbox>
    <span @click="handleBatchDownload">下载</span>
  </div>
  <van-checkbox-group v-model="selectedIds" class="p-4" @change="checkedResultChange">
    <div v-for="item in sharedFileList" :key="item.attachmentId" class="flex items-center mb-4 ">
      <van-checkbox v-if="allowDownload" :name="item.attachmentId">
      </van-checkbox>
      <div class="flex-1 flex items-center ml-2" @click="handleClick(item)">
        <img :src="getIcon(item.format)" alt="" class="inline-block w-10 h-10 mr-2" />
        <div class="flex-1 w-0">
          <div class="w-full text-[16px] text-[#151515] overflow-hidden whitespace-nowrap text-ellipsis">
            {{ item.name }}
          </div>
          <div class="text-[14px] text-[#999999]">
            添加时间：{{ dayjs(item.uploadTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>
        <div v-if="allowDownload" class="w-[24px] h-[24px] flex items-center justify-center" @click.stop="handleDownload(item)">
          <van-icon name="back-top" class=" transform rotate-180" />
        </div>
      </div>
    </div>
  </van-checkbox-group>
  <van-popup v-model:show="showCenter" round :style="{ width: '90%', height: '95%' }" closeable>
    <div class="text-[16px] font-bold text-[#151515] text-center py-3">
      {{ currentFile?.name }}
    </div>
    <div style="height: calc(100% - 48px)">
      <PdfViewer v-if="currentFile && showCenter" class="content" :url="currentFile.url"></PdfViewer>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import type { IFileEntity } from '~/views/common/file-manage/api'
import dayjs from 'dayjs'
import { closeToast, showDialog, showImagePreview, showLoadingToast } from 'vant'
import { getIcon, isImage } from '~/utils/fileUtils'
import PdfViewer from '../../components/PdfViewer.vue'
import { getSharedFileListApi } from './api'

/** # 文件分享页面参数 ⚙️ */
const unitCode = ref('')
const shareId = ref('')

const showCenter = ref(false)
const sharedFileList = ref<IFileEntity[]>([])
const currentFile = ref<IFileEntity>()

const allowDownload = ref(false)
const isCheckAll = ref(false)
const isIndeterminate = ref(false)
/** # 选中的文件ID列表 */
const selectedIds = ref<string[]>([])

function checkAllChange(val: boolean) {
  selectedIds.value = val ? sharedFileList.value.map(item => item.attachmentId) : []
  isIndeterminate.value = false
}

function checkedResultChange(value: string[]) {
  const checkedCount = value.length
  isCheckAll.value = checkedCount === sharedFileList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < sharedFileList.value.length
}

/** # 从URL路径中提取参数 ⚙️ */
function extractParamsFromUrl() {
  const pathname = window.location.pathname
  // 解析路径：/ilis2/ds/gfzx/2003725222860664832
  const pathParts = pathname.split('/').filter(part => part !== '')
  shareId.value = pathParts[pathParts.length - 1] || ''
  unitCode.value = pathParts[pathParts.length - 2] || ''
  allowDownload.value = new URLSearchParams(window.location.search).get('allowDownload') === 'true'
}

async function getSharedFileList() {
  const { data } = await getSharedFileListApi(shareId.value, unitCode.value)
  sharedFileList.value = data || []
}

async function handleBatchDownload() {
  if (selectedIds.value.length === 0) {
    showDialog({
      title: '提示',
      message: '请选择要下载的文件！',
    })
    return
  }
  if (isWechatEnv()) {
    showDialog({
      title: '提示',
      message: '当前环境不支持直接下载文件，请点击右上角在浏览器中打开！',
    })
    return
  }
  const selectedFiles = sharedFileList.value.filter(item => selectedIds.value.includes(item.attachmentId))
  showLoadingToast({
    message: '下载中...',
  })
  await Promise.all(selectedFiles.map((file) => {
    return downloader.excute(file.url, file.name)
  }))
  closeToast()
}

async function handleDownload(item: IFileEntity) {
  if (isWechatEnv()) {
    showDialog({
      title: '提示',
      message: '当前环境不支持直接下载文件，请点击右上角在浏览器中打开！',
    })
    return
  }
  try {
    showLoadingToast({
      message: '下载中...',
    })
    await downloader.excute(item.url, item.name)
    closeToast()
  }
  catch (error) {
    console.error('通过创建blob的文件下载失败:', error)
    // 下载失败，尝试在新窗口打开，触发自行下载
    window.open(item.url, '_blank')
    closeToast()
  }
}

async function handleClick(item: IFileEntity) {
  if (isImage(item.format)) {
    const index = sharedFileList.value.findIndex(file => file.attachmentId === item.attachmentId)
    const images = sharedFileList.value?.filter(file => isImage(file.format))?.map(file => file.url) || []
    showImagePreview({
      images,
      startPosition: index,
    })
  }
  else if (isPdf(item.format)) {
    currentFile.value = item
    showCenter.value = true
  }
  else {
    if (isWechatEnv()) {
      showDialog({
        title: '提示',
        message: '当前环境不支持直接下载文件，请点击右上角在浏览器中打开！',
      })
      return
    }
    try {
      showLoadingToast({
        message: '下载中...',
      })
      await downloader.excute(item.url, item.name)
      closeToast()
    }
    catch (error) {
      console.error('通过创建blob的文件下载失败:', error)
      // 下载失败，尝试在新窗口打开，触发自行下载
      window.open(item.url, '_blank')
      closeToast()
    }
  }
}

function init() {
  extractParamsFromUrl()
  getSharedFileList()
}

init()
</script>

<style scoped>
:deep(.van-checkbox__label){
  flex:1;
}
</style>
