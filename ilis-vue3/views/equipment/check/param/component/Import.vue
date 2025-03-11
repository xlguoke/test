<template>
  <HtModal
    v-model:open="internalOpen"
    title="导入检校参数"
    width="500px"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <div class=" mb-4">
      <BaseTitle>导入步骤</BaseTitle>
      <div>1、下载检校参数导入模板，<span class="text-primaryColor cursor-pointer" @click="downloadTemplate">点击下载</span></div>
      <div>2、按设备编号及设备名称录入对应检校参数</div>
      <div>3、点击下方“选择文件”选中（单选）编辑好的模板文件</div>
    </div>
    <div>
      <BaseTitle>选择文件</BaseTitle>
      <a-upload
        v-model:file-list="fileList"
        action="#"
        accept=".xlsx,.xls"
        :max-count="1"
        :custom-request="handleUpload"
      >
        <span>上传文件：</span>
        <a-button type="primary">
          选择文件
        </a-button>
      </a-upload>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { Modal, type UploadFile, message } from 'ant-design-vue'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import { importParam } from '../api'
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogProps<null>>()

const internalOpen = ref(true)

const fileList = ref<UploadFile[]>([])

async function handleUpload(option: UploadRequestOption) {
  const { data } = await importParam(option.file)
  if (data.code === 20000) {
    fileList.value = []
    message.success('导入成功')
    props.onConfirm(null)
    internalOpen.value = false
  }
  if (data?.code === 20010 && data.error?.length) {
    fileList.value[0].status = 'error'
    Modal.error({
      title: '导入失败',
      content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, data.error.map((item: string) => {
        return h('p', item)
      })),
    })
  }
}

function downloadTemplate() {
  window.open('/ilis2/rest/equipmentNewController?downloadCheckItem')
}
</script>
