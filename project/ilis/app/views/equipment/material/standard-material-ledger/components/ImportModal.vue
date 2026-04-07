<template>
  <HtModal
    v-model:open="visible"
    title="导入标准物质"
    width="600px"
    centered
    :mask-closable="false"
    :hide-confirm="true"
    :after-close="onClosed"
    @cancel="handleCancel"
  >
    <div class="mb-3">
      <BaseTitle>导入步骤</BaseTitle>
      <div>
        <ul style="font-size: 14px;">
          <li>
            1、下载导入模板，<a href="#" style="color: #165dff; text-decoration-line: underline;" @click="downloadTemplate()">点击下载</a>
          </li>
          <li>2、按模板内容和数据格式要求填写导入模板</li>
          <li>3、点击下方"选择文件"选中（单选）编辑好的模板文件后，即可导入</li>
        </ul>
      </div>
    </div>
    <div>
      <BaseTitle>选择文件</BaseTitle>
      <div style="font-size: 14px;">
        <span>模板文件：</span>
        <a-upload
          name="file"
          accept=".xls, .xlsx"
          :show-upload-list="false"
          :custom-request="onImport"
        >
          <a-button type="primary">
            选择文件
          </a-button>
        </a-upload>
      </div>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import sseRequestProgress from '~/components/sseRequestProgress'

const props = defineProps<IDialogProps<null>>()

const visible = ref(true)

function handleCancel() {
  visible.value = false
}

function downloadTemplate() {
  window.open('/ilis2/rest/ref/material/download/template')
}

async function onImport(info: any) {
  sseRequestProgress.show({
    api: 'rest/ref/material/import',
    method: 'postForm',
    data: {
      file: info.file,
    },
    onComplete: (res) => {
      if (res?.length) {
        Modal.error({
          title: '导入失败',
          content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, res.map((item: any) => {
            return h('p', item)
          })),
          okText: '确定',
          centered: true,
        })
      }
      else {
        props.onConfirm(null)
        visible.value = false
        message.success('导入成功')
      }
    },
  })
}
</script>
