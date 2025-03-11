<template>
  <ht-modal
    v-model:open="visible"
    :title="`${editId ? '编辑' : '添加'}规程`"
    width="640px"
    :confirm-loading="saveLoading"
    @ok="saveData"
    @cancel="cancel"
  >
    <a-spin :spinning="spinning">
      <a-form
        ref="formRef"
        :model="form"
        class="pt-2 max-h-[70vh] overflow-auto"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="规程名称" name="standardName" :rules="[{ required: true, message: '请输入规程名称' }]">
          <a-input
            v-model:value="form.standardName"
            :disabled="isDetail"
            allow-clear
            placeholder="请输入规程名称"
          />
        </a-form-item>
        <a-form-item label="颁布号" name="publishCode">
          <a-input
            v-model:value="form.publishCode"
            :disabled="isDetail"
            allow-clear
            placeholder="请输入颁布号"
          />
        </a-form-item>
        <a-form-item label="执行日期" name="executeDate" :rules="[{ required: true, message: '请选择执行日期' }]">
          <a-date-picker
            v-model:value="form.executeDate"
            style="width:100%;"
            :disabled="isDetail"
            value-format="YYYY-MM-DD"
            placeholder="请选择执行日期"
          />
        </a-form-item>
        <a-form-item label="过期日期" name="expireDate">
          <a-date-picker
            v-model:value="form.expireDate"
            style="width:100%;"
            :disabled="isDetail"
            value-format="YYYY-MM-DD"
            placeholder="请选择过期日期"
          />
        </a-form-item>
        <a-form-item label="规程文件" name="fileId">
          <a-button class="flex items-center" @click="upload">
            <UploadOutlined />
            上传文件
          </a-button>
          <a
            v-if="form.fileId"
            :href="form.fileUrl"
            class="block mt-2 px-1 text-blue-500 hover:bg-gray-100"
            target="_blank"
          >
            {{ form.fileName }}
          </a>
        </a-form-item>
        <a-form-item label="是否为本单位规程" name="whetherThisUnit">
          <a-radio-group v-model:value="form.whetherThisUnit">
            <a-radio v-for="(d, i) in BOOLEAN_DATAS" :key="i" :value="d.key">
              {{ d.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="规程类型" name="type">
          <a-radio-group v-model:value="form.type">
            <a-radio v-for="(d, i) in STANDARD_TYPE_DICT" :key="i" :value="d.key">
              {{ d.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="!editId" label="被替换规程">
          <a-button class="flex items-center" @click="openSelectStandard">
            <PlusOutlined />
            选择规程
          </a-button>
          <div class="mt-2">
            <p
              v-for="(item, index) in replaceStandards"
              :key="index"
              href="#"
              class="px-1 flex justify-between hover:bg-gray-100 cursor-pointer"
            >
              <span>{{ item.standardName }}</span>
              <DeleteOutlined style="color:#ff4d4f" @click="deleteStandard(index)" />
            </p>
          </div>
        </a-form-item>
      </a-form>
    </a-spin>

    <Upload ref="uploadRef" @save="getUploadFile" />
  </ht-modal>

  <ht-modal
    v-model:open="standardVisible"
    title="选择规程"
    width="80%"
    @ok="handleSelect"
    @cancel="cancelSelect"
  >
    <iframe
      id="standardIframe"
      style="border:0;"
      width="100%"
      height="400px"
      :src="standardUrl"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import { inject, ref, unref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { type SaveStandardParam, saveStandardApi, standardDetailApi } from '../api'
import { BOOLEAN_DICT, BOOLEAN_OPT, STANDARD_TYPE, STANDARD_TYPE_DICT } from '../'
import Upload, { type FileInfo } from './Upload.vue'

const emits = defineEmits<{
  (e: 'save'): void
}>()

/** jsp页面引用时，传入的参数 */
const urlParams = unref(inject('urlParams')) as any

const BOOLEAN_DATAS = BOOLEAN_DICT.exclude([BOOLEAN_OPT.ALL])
const visible = ref(false)
const isDetail = ref(false)
const editId = ref('')
const saveLoading = ref(false)
const spinning = ref(false)
const defaultStandardType = ref()
const defaultType = ref()
const form = ref<SaveStandardParam>({
  standardTypeId: '',
  standardName: '',
  executeDate: '',
  whetherThisUnit: BOOLEAN_OPT.TRUE,
  type: STANDARD_TYPE.ALL,
  fileId: '',
  fileName: '',
  fileUrl: '',
})

// 获取数据
async function getData() {
  spinning.value = true
  try {
    const { data } = await standardDetailApi(editId.value)
    const { executeDate, expireDate } = data.obj
    data.obj.executeDate = executeDate ? dayjs(executeDate).format('YYYY-MM-DD') : ''
    data.obj.expireDate = expireDate ? dayjs(expireDate).format('YYYY-MM-DD') : ''
    if (!data.obj.useType) {
      data.obj.useType = defaultType.value || STANDARD_TYPE.ALL
    }
    form.value = data.obj
  }
  finally {
    spinning.value = false
  }
}

// 检查颁布号
async function checkPublishCode() {
  return new Promise((resolve) => {
    if (form.value.publishCode) {
      return resolve(true)
    }
    Modal.confirm({
      title: '提示',
      content: '当前规程未输入颁布号，是否继续添加？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        resolve(true)
      },
      onCancel: () => {
        resolve(false)
      },
    })
  })
}

// 保存数据
const formRef = ref()

function saveData() {
  formRef.value.validateFields().then(async () => {
    const params: SaveStandardParam = {
      id: editId.value || '',
      // 选择模式下没有类型id，放到“未设置类型”中
      standardTypeId: urlParams.selectedMode.value ? '2c9284d073952df40173d74750a1172c' : defaultStandardType.value,
      standardName: form.value.standardName,
      publishCode: form.value.publishCode,
      executeDate: form.value.executeDate,
      expireDate: form.value.expireDate,
      fileId: form.value.fileId,
      type: form.value.type,
      whetherThisUnit: form.value.whetherThisUnit,
    }

    // 新增
    if (!params.id) {
      params.replaceStandards = form.value.replaceStandards
      delete params.id
    }
    try {
      if (!await checkPublishCode())
        return
      saveLoading.value = true
      await saveStandardApi(params)
      message.success('保存成功')
      emits('save')
      cancel()
    }
    catch (e) {
      console.error(e)
      saveLoading.value = false
    }
  })
}

// 上传
const uploadRef = ref()

function upload() {
  uploadRef.value.showModal()
}

// 上传回调
function getUploadFile(file?: FileInfo) {
  form.value.fileId = file?.fileId || ''
  form.value.fileName = file?.fileName || ''
  form.value.fileUrl = file?.fileUrl || ''
}

// 替换规程
const standardUrl = ref('')
const standardVisible = ref(false)
const replaceStandards = ref<{
  standardId: string
  standardName: string
}[]>([])

function openSelectStandard() {
  standardUrl.value = `${location.origin}/ilis2/baseStandardNewController.do?goImportStandards`
  standardVisible.value = true
}

function cancelSelect() {
  standardUrl.value = ''
  standardVisible.value = false
}

function handleSelect() {
  const data = (document.getElementById('standardIframe') as any).contentWindow.returnImport()
  replaceStandards.value = data.map((item: any) => ({
    standardId: item.id,
    standardName: item.standardName,
  }))
  form.value.replaceStandards = replaceStandards.value.map(item => item.standardId)
  cancelSelect()
}

function deleteStandard(ind: number) {
  replaceStandards.value.splice(ind, 1)
  form.value.replaceStandards = replaceStandards.value.map(item => item.standardId)
}

// 关闭弹窗
function cancel() {
  visible.value = false
  replaceStandards.value = []
  formRef.value?.resetFields()
}

// 打开弹窗
function showModal(id?: string, typeId?: string) {
  saveLoading.value = false
  visible.value = true
  editId.value = id || ''
  defaultStandardType.value = typeId || ''
  defaultType.value = urlParams.useType.value || STANDARD_TYPE.ALL
  if (id)
    getData()
}

defineExpose({
  showModal,
})
</script>

<style>

</style>
