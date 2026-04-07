<template>
  <div>
    <ht-modal
      v-model:open="visible"
      width="500px"
      title="导入参数信息"
      @cancel="handleCancel"
    >
      <template #footer>
        <a-button @click="handleCancel">
          关闭
        </a-button>
      </template>
      <BaseTitle>导入步骤</BaseTitle>
      <p>
        1、下载查新信息导入模板，
        <a
          href="#"
          class="text-blue-500 hover:text-blue-400"
          @click="downloadTemplate"
        >
          点击下载
        </a>
      </p>
      <p>2、根据模板内容填写参数信息</p>
      <p>3、点击下方“选择文件”选中（单选）编辑好的模板文件后，即可导入</p>

      <BaseTitle class="mt-4">
        选择文件
      </BaseTitle>

      <div class="flex h-20">
        <span>模板文件：</span>
        <a-upload
          v-model:file-list="fileList"
          action="#"
          accept=".xlsx,.xls"
          :max-count="1"
          :custom-request="handleUpload"
          :disabled="loading"
        >
          <a-button type="primary">
            选择文件
          </a-button>
          <span class="ml-10 text-gray-500">
            只支持 .xlsx,.xls 格式文件
          </span>
        </a-upload>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="errorVisible"
      width="640px"
      title="导入失败"
      @cancel="cancelErrorModal"
    >
      <template #footer>
        <a-button type="primary" @click="cancelErrorModal">
          确定
        </a-button>
      </template>
      <div class="min-h-[300px]">
        <p class="mb-2">
          导入模板中存在以下问题，请编辑模板文件后重新导入！
        </p>
        <a-table
          :columns="errorColumns"
          :data-source="errorDatas"
          :scroll="{ y: '50vh' }"
          :pagination="false"
          bordered
        />
      </div>
    </ht-modal>
  </div>
</template>

<script setup lang='ts'>
import type { UploadFile } from 'ant-design-vue'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import { message } from 'ant-design-vue'
import { importParam } from '../api.ts'

const visible = ref(false)
const errorVisible = ref(false)
const fileList = ref<UploadFile[]>([])
const sampleId = ref('')
const errorDatas = ref([])
const loading = ref(false)

const errorColumns = [
  {
    title: '表名',
    dataIndex: 'sheetName',
    key: 'sheetName',
    width: 150,
    customCell: (row: any) => ({
      rowSpan: row.rowSpan,
    }),
  },
  {
    title: '行号',
    dataIndex: 'row',
    key: 'row',
    width: 60,
  },
  {
    title: '问题内容',
    dataIndex: 'message',
    key: 'message',
  },
]

async function handleUpload(option: UploadRequestOption) {
  const file = option.file as File
  const dot = file.name.lastIndexOf('.')
  const type = file.name.substring(dot + 1)
  if (type !== 'xlsx' && type !== 'xls') {
    fileList.value = []
    message.error('只支持 .xlsx、.xls 格式文件')
    return
  }

  try {
    loading.value = true
    const { data } = await importParam(sampleId.value, file)
    loading.value = false
    if (data.code === 21000 && data.data.success) {
      fileList.value = []
      message.success('导入成功')
      handleCancel()
    }
    else {
      fileList.value = []
      const errs = data.data.errors || []
      if (errs.length) {
        let ind = 0
        errs[0].rowSpan = 1
        ;(function _each(m) {
          if (ind >= errs.length - 1)
            return
          ind++

          if (errs[m].sheetName === errs[ind].sheetName) {
            errs[m].rowSpan++
            errs[ind].rowSpan = 0
            _each(m)
          }
          else {
            errs[ind].rowSpan = 1
            _each(ind)
          }
        })(0)

        errorDatas.value = errs
        errorVisible.value = true
      }
      else {
        message.error('导入失败')
      }
    }
  }
  catch (err) {
    console.error(err)
    loading.value = false
    fileList.value = []
  }
}

function downloadTemplate() {
  window.open(`/ilis2/rest/sample/param/structure/export-sample?sampleId=${sampleId.value}`, '_blank')
}

function handleCancel() {
  sampleId.value = ''
  fileList.value = []
  visible.value = false
}

function cancelErrorModal() {
  errorVisible.value = false
  errorDatas.value = []
}

if (!window.vm) {
  window.vm = {}
}
window.vm.openImportParamModal = (id: string) => {
  sampleId.value = id
  visible.value = true
}
</script>

<style>

</style>
