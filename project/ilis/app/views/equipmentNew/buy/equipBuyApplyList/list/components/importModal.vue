<template>
  <div>
    <ht-modal
      title="导入购置设备"
      :open="visible"
      width="600px"
      centered
      :mask-closable="false"
      :destroy-on-close="true"
      cancel-text="取消"
      :hide-confirm="true"
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
            <li>3、点击下方“选择文件”选中（单选）编辑好的模板文件后，即可导入</li>
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
            :custom-request="onImportForList"
          >
            <a-button type="primary">
              选择文件
            </a-button>
          </a-upload>
        </div>
      </div>
    </ht-modal>
  </div>
</template>

<script lang="ts" setup>
import { message, Modal } from 'ant-design-vue'
import { ref } from 'vue'
import sseRequestProgress from '~/components/sseRequestProgress'
import { rootUrl } from '~/providers/configs/rootUrl'

// 上传文件数据
const emits = defineEmits([
  'callback',
])

const visible = ref(false)
function showModal() {
  visible.value = true
}
function handleCancel() {
  visible.value = false
}
function downloadTemplate() {
  window.open(`${rootUrl}${window.$oApi.equipBuyApplyList.download}`)
}
async function onImportForList(file: any) {
  sseRequestProgress.show({
    api: `${window.$oApi.equipBuyApplyList.import}`,
    method: 'postForm',
    data: {
      file: file.file,
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
        emits('callback')
        visible.value = false
        message.success('导入成功')
      }
    },
  })
}
defineExpose({
  showModal,
})
</script>
