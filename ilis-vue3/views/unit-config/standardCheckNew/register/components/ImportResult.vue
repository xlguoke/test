<template>
  <ht-modal
    v-model:open="visible"
    title="导入查新结果"
    width="500px"
    hide-confirm
    :loading="loading"
    :after-close="onClosed"
    @cancel="cancel"
  >
    <div class="p-2">
      <base-title>导入步骤</base-title>
      <p>1、下载查新信息导入模板，<a href="#" class="text-[#0066ec]" @click="downloadTemplate">点击下载</a></p>
      <p>2、根据模板内容填写查新数据</p>
      <p>3、点击下方“选择文件”选中（单选）编辑好的模板文件后，即可导入</p>

      <base-title class="mt-[20px]">
        选择文件
      </base-title>
      模板文件：
      <a-upload :before-upload="beforeUpload" :show-upload-list="false">
        <a-button type="primary">
          选择文件
        </a-button>
      </a-upload>
    </div>
  </ht-modal>

  <ht-modal
    v-model:open="resVisible"
    title="导入失败"
    width="700px"
    @cancel="resCancel"
  >
    <div class="min-h-[30vh]">
      导入模板中存在以下问题，请编辑模板文件后重新导入！
      <a-table
        :columns="columns"
        :data-source="errList"
        :pagination="false"
        :scroll="{ y: '60vh' }"
      />
    </div>
    <template #footer>
      <a-button type="primary" @click="resVisible = false">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import { message } from 'ant-design-vue'
import { type RecordListParam, importCheckNewResultApi, modalError } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface PropsParam {
  /** 查新id */
  checkNewId: string
  /** 列表查询参数 */
  queryParam: RecordListParam
}

const props = defineProps<IDialogPropsParam<null, PropsParam>>()
const { checkNewId, queryParam } = props.param

const columns: ColumnsType = [
  { title: '行号', dataIndex: 'row', width: 60, align: 'center' },
  { title: '问题内容', dataIndex: 'message' },
]

const loading = ref(false)
const visible = ref(true)
const resVisible = ref(false)
const errList = ref([])

function cancel() {
  visible.value = false
}

/**
 * 下载模板
 */
function downloadTemplate() {
  const params = new URLSearchParams(queryParam as any)
  const url = `/ilis2/rest/standard/check/new/import-register-template?${params}`
  window.open(url, '_blank')
}

/**
 * 导入
 */
async function importResult(file: File) {
  const res = await importCheckNewResultApi(checkNewId, file)
  if (res.data && !res.data.data.success) {
    errList.value = res.data.data.errors || []
    resVisible.value = true
  }
  else {
    message.success('导入成功！')
    visible.value = false
    props.onConfirm(null)
  }
}
function resCancel() {
  resVisible.value = false
  errList.value = []
}

function beforeUpload(file: File) {
  if (!(['.xls', '.xlsx'].includes(fileType(file.name)))) {
    modalError('文件格式错误，仅支持导入xls和xlsx格式文件！', '导入失败！')
  }
  else {
    importResult(file)
  }
  return false
}

function fileType(name: string) {
  return name.slice(name.lastIndexOf('.'))
}
</script>

<style scoped>
p{
  margin-bottom: 4px;
}
</style>
