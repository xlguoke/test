<template>
  <AppProvider>
    <HtUploadFile
      v-if="isInit"
      :business-type="initData.businessType"
      :business-id="initData.businessId"
      :qr-code-url="initData.qrCodeUrl"
      :parent-key="initData.parentKey"
      :recursion="initData.recursion"
      :hide-file-list="initData.hideFileList"
      :is-reandonly="initData.isReandonly"
      :force-init="initData.forceInit"
      :accept="initData.accept"
      @init-complete="initComplete"
      @get-data="getData"
    ></HtUploadFile>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { PropData, UploadFileData } from '~/components/htUploadFile'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'

const isInit = ref(false)
const initData = ref<PropData>({
  businessType: BUSINES_TYPE.DEFAULT,
})

function initUploadFile(data: PropData) {
  initData.value = data
  isInit.value = true
}

// 初始化完成执行
function initComplete(data: UploadFileData) {
  if (window.vm_initUploadFileComplete)
    window.vm_initUploadFileComplete(data)
}

// 初始化完成执行
function getData(data: UploadFileData) {
  if (window.vm_getUploadFileData)
    window.vm_getUploadFileData(data)
}

if (!window.vm) {
  window.vm = {}
}
window.vm.initUploadFile = initUploadFile
</script>

<style>

</style>
