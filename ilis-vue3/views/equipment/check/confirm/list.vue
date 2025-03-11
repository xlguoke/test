<template>
  <AppProvider>
    <a-card style="width: 100%">
      <a-space direction="vertical" style="width: 100%;">
        <div class="t bg-[#c6e4fe] px-3 py-3">
          <div class="title ">
            温馨提示
          </div>
          <div class="line">
            当系统中生成的检校确认表无法满足您的要求时，您可直接上传签字完成的检校确认表。
          </div>
          <div class="line">
            点确定后，则无需走审批流程，状态直接变为审批通过。
          </div>
        </div>
        <div class="upload flex ">
          <!-- <HtUploadFile
            business-type="EQ_CHECK_CONFIRM"
            force-init
            :accept="['pdf', 'jpg', 'jpeg', 'png']"
            :business-id="businessId"
            @get-qr-code-key="handleGetData"
          /> -->
          <a-upload
            v-model:file-list="fileList"
            action="#"
            accept=".pdf,.jpg,.jpeg,.png"
            :max-count="1"
            :custom-request="handleUpload"
          >
            <span>上传检校确认表: </span>
            <a-button type="primary">
              选择文件
            </a-button>
          </a-upload>
        </div>
        <p class=" pr-3 text-gray-400">
          允许上传的文件格式：pdf、jpg、jpeg、png
        </p>
      </a-space>
    </a-card>
  </AppProvider>
</template>

<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import { upload } from './api'

const businessId = ref('')

// 来自于父级iframe 传递的参数 --(检校确认)
businessId.value = parent.businessId

const confirmFileId = ref('')
const fileList = ref<UploadFile[]>([])

async function handleUpload(option: UploadRequestOption) {
  const { data } = await upload(option.file)
  if (data.success) {
    fileList.value[0].status = 'success'
    confirmFileId.value = data?.obj?.[0]?.id as string
  }
  else {
    fileList.value[0].status = 'error'
  }
}
function getConfirmFileId() {
  return confirmFileId.value
}

window.getConfirmFileId = getConfirmFileId
</script>

<style>

</style>
