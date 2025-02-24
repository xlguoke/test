<template>
  <div class="gao-pai-yi-wrapper">
    <div class="gpy-head">
      <a-form :model="form" layout="inline">
        <a-form-item label="分辨率">
          <a-select
            v-model="form.resolution"
            :disabled="!openSuccess"
            class="w-120"
            placeholder="请选择"
            @change="toSetResolution"
          >
            <a-select-option v-for="d in resolutionArr" :key="d.value" :value="d.value">
              {{ d.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="输出格式">
          <a-select
            v-model="form.fileType"
            :disabled="!openSuccess"
            placeholder="请选择"
            @change="toSetFileType"
          >
            <a-select-option v-for="d in fileTypeDatas" :key="d.value" :value="d.value">
              {{ d.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="输出效果">
          <a-select
            v-model="form.colorMode"
            :disabled="!openSuccess"
            placeholder="请选择"
            @change="toSetColorModel"
          >
            <a-select-option v-for="d in colorModeDatas" :key="d.value" :value="d.value">
              {{ d.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="扫描页面">
          <a-select
            v-model="form.scanPage"
            :disabled="!openSuccess || readonlyScanPage"
            placeholder="请选择"
          >
            <a-select-option v-for="d in scanPageDatas" :key="d.value" :value="d.value">
              {{ d.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="扫描模式">
          <a-select v-model="form.scanMode" :disabled="!openSuccess" placeholder="请选择">
            <a-select-option v-for="d in scanModeDatas" :key="d.value" :value="d.value">
              {{ d.title }}
            </a-select-option>
          </a-select>
        </a-form-item> -->
        <a-form-item label="裁切方式">
          <a-select
            v-model="form.cutMode"
            :disabled="!openSuccess"
            class="w-100"
            placeholder="请选择"
            @change="setCameraCutMode"
          >
            <a-select-option v-for="d in cutModeDatas" :key="d.value" :value="d.value">
              {{ d.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <a-button type="primary" :disabled="!openSuccess" @click="takePhoto">
        拍摄
      </a-button>
    </div>
    <div class="gpy-body">
      <!-- 待合成文件列表 -->
      <div class="gpy-side">
        <div class="gpy-side-head">
          <div :class="`export-btn ${isMultipage ? '' : 'disabled'}`" @click="exportPDF">
            合并导出PDF
          </div>
        </div>
        <div class="gpy-side-content">
          <a-checkbox-group v-model="selectedFileIds" style="width: 100%">
            <div v-for="(d, i) in tempScanResult" :key="i" class="scan-result-item">
              <img class="scan-result-img" :src="d.src" alt="">
              <a-checkbox :value="d.id" />
              <div class="handle">
                <ArrowUpOutlined @click="toMoveFile(i, 0)" />
                <ArrowDownOutlined @click="toMoveFile(i, 1)" />
                <DeleteOutlined @click="toDeleteFile(i, 1)" />
              </div>
            </div>
          </a-checkbox-group>
          <p v-if="!isMultipage" class="un-multipage">
            单页模式不可用
          </p>
        </div>
      </div>
      <!-- 摄像区域操作栏 -->
      <div class="main-camera-tool">
        <ul :class="`tools-wrap ${openSuccess ? '' : 'disabled'}`">
          <li title="左旋" @click="toSetRotateLeft">
            <UndoOutlined />
          </li>
          <li title="右旋" @click="toSetRotateRight">
            <RedoOutlined />
          </li>
          <li title="放大" @click="toSetZoomIn">
            <ZoomInOutlined />
          </li>
          <li title="缩小" @click="toSetZoomOut">
            <ZoomOutOutlined />
          </li>
          <li title="1:1" style="font-weight: bold; font-size: 14px" @click="toSetTrueSize">
            1:1
          </li>
          <li title="适屏" @click="toSetBestSize">
            <FullscreenExitOutlined />
          </li>
        </ul>
      </div>

      <!-- 摄像区域 -->
      <div class="gpy-content">
        <a-spin :spinning="loading" :tip="loadingText">
          <div ref="CameraCtl" class="gpy-camera" />
        </a-spin>
      </div>
      <!-- 已拍摄文件列表 -->
      <div class="gpy-side gpy-side-right">
        <div class="gpy-side-head">
          <ul class="gpy-side-head-ul">
            <li>待上传列表</li>
            <!-- <li class="open-folder" @click="openFolder">打开文件夹</li> -->
          </ul>
        </div>
        <div class="gpy-side-content">
          <div v-for="(d, i) in scanResultDatas" :key="i" class="scan-result-item">
            <FilePdfOutlined v-if="d.type === 'pdf'" class="scan-result-pdf" />

            <img
              v-else
              class="scan-result-img"
              :src="d.src"
              alt=""
            >
            <p class="scan-result-name">
              {{ d?.name }}
            </p>
            <p class="delete-icon" @click="toDeleteFile(i, 2)">
              <DeleteOutlined />
            </p>
          </div>
        </div>
        <p class="gpy-side-footer">
          文件存放位置：{{ fileFolder }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FullscreenExitOutlined,
  RedoOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons-vue'
import { useGpyCallback } from './gpyhs_cb'

const emits = defineEmits(['cancel'])

const {
  fileTypeDatas,
  colorModeDatas,
  resolutionArr,
  scanPageDatas,
  cutModeDatas,
  CameraCtl,
  camW,
  camH,
  form,
  toSetResolution,
  isMultipage,
  fileFolder,
  openSuccess,
  loading,
  loadingText,
  scanResultDatas,
  tempScanResult,
  selectedFileIds,
  handleControl,
  deleteType,
  deleteInd,
  debounce,
  readonlyScanPage,
} = useGpyCallback({
  cancelCallback: () => {
    emits('cancel')
  },
})

function getCamSize() {
  const dom = CameraCtl.value
  camW.value = dom.offsetWidth
  camH.value = dom.offsetHeight
  return dom
}

// 初始化控件
function initControl() {
  loading.value = true
  loadingText.value = '正在启动摄像头...'
  openSuccess.value = false
  const dom = getCamSize()
  window.Cam_ControlInit(dom, camW.value, camH.value, getCurrentInstance()?.appContext)
}

// 生成图片基础信息：多页模式时，拍摄结果始终为图片格式，最终合并导出为PDF
function createFileInfo() {
  const type = isMultipage.value
    ? 'jpg'
    : fileTypeDatas.value?.find(d => d.value === form.fileType)?.title
  const fileName = `${formatDate()}.${type}`
  const filePath = fileFolder.value + fileName
  return { path: filePath, name: fileName, type }
}

// 拍摄
function takePhoto() {
  debounce(() => {
    const fileInfo = createFileInfo()
    // 设置文件格式
    window.Cam_SetFileType(fileInfo.type)
    // 主摄像头拍照
    window.Cam_Photo(fileInfo.path)
  }, 300)
}

// 导出PDF
function exportPDF() {
  if (!isMultipage.value)
    return
  const files = tempScanResult.value?.filter(d => selectedFileIds.value?.includes(d.id))
  if (files.length === 0) {
    return message.warning('请选择需要导出的文件！')
  }
  const pathStr = files.map(d => d.path).join(';')
  window.Cam_AddImgFileToPDF(pathStr)
}

// 删除文件
function toDeleteFile(ind: any, type: any) {
  if (handleControl.value)
    return
  handleControl.value = true
  let path = ''
  if (type === 1) {
    path = tempScanResult.value[ind].path
  }
  else {
    path = scanResultDatas.value[ind].path
  }
  deleteInd.value = ind
  deleteType.value = type
  window.DeleteFile(path)
}

// 设置输出格式
function toSetFileType(val: any) {
  if (val === 3) {
    form.scanPage = 1
    readonlyScanPage.value = false
  }
  else {
    deleteTempScanResult()
    form.scanPage = 0
    readonlyScanPage.value = true
  }
  window.Cam_SetFileType(val)
}

// 设置输出效果
function toSetColorModel(val: any) {
  window.Cam_SetColorMode(val)
}

// 设置裁切方式
function setCameraCutMode(val: any) {
  window.Cam_SetCutMode(val)
  if (val !== 3)
    return
  // 自定义裁切
  window.SetCustomArea(0, 0, camW.value, camH.value)
}

// 左旋
function toSetRotateLeft() {
  window.Cam_RotateLeft()
}
// 右旋
function toSetRotateRight() {
  window.Cam_RotateRight()
}
// 放大
function toSetZoomIn() {
  window.Cam_ZoomIn()
}

// 缩小
function toSetZoomOut() {
  window.Cam_ZoomOut()
}

// 1:1
function toSetTrueSize() {
  window.Cam_TrueSize()
}

// 适屏
function toSetBestSize() {
  window.Cam_BestSize()
}

// 排序
function toMoveFile(ind: any, dir: any) {
  if (dir && ind === tempScanResult.value.length - 1)
    return
  if (!dir && ind === 0)
    return
  const item = tempScanResult.value[ind]
  tempScanResult.value.splice(ind, 1)
  if (dir) {
    tempScanResult.value.splice(ind + 1, 0, item)
  }
  else {
    tempScanResult.value.splice(ind - 1, 0, item)
  }
}

// 获取已拍摄文件
function getFiles() {
  if (scanResultDatas.value.length === 0) {
    message.warning('待上传列表不能为空！')
    return
  }
  // 多页模式，上传文件时删除未导出的文件
  if (isMultipage.value) {
    deleteTempScanResult()
  }
  return scanResultDatas.value
}

// 删除未导出的数据
function deleteTempScanResult() {
  for (let i = 0; i < tempScanResult.value.length; i++) {
    const item = tempScanResult.value[i]
    window.DeleteFile(item.path)
  }
  tempScanResult.value = []
}

function formatDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const min = date.getMinutes()
  const sec = date.getSeconds()
  const newTime
        = year
        + (month < 10 ? `0${month}` : month).toString()
        + (day < 10 ? `0${day}` : day)
        + (hour < 10 ? `0${hour}` : hour)
        + (min < 10 ? `0${min}` : min)
        + (sec < 10 ? `0${sec}` : sec)
  return newTime
}

onMounted(() => {
  initControl()
})

defineExpose({
  getFiles,
})
</script>

<style lang="less" scoped>
@import './gpy.less';
</style>
