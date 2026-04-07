<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="`${editId ? '编辑' : '添加'}规程`"
      width="640px"
      :confirm-loading="saveLoading"
      destroy-on-close
      @ok="checkBeforeSave(editId)"
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
          <a-form-item label="发布日期" name="publishDate" :rules="[{ message: '请选择发布日期' }]">
            <a-date-picker
              v-model:value="form.publishDate"
              style="width:100%;"
              :disabled="isDetail"
              value-format="YYYY-MM-DD"
              placeholder="请选择发布日期"
            />
          </a-form-item>
          <a-form-item label="执行日期" name="executeDate" :rules="[{ message: '请选择执行日期' }]">
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
            <a-button class="flex items-center" @click="showFileModal = true">
              <UploadOutlined />
              上传文件
            </a-button>
            <AttachmentList v-if="standardFiles.length > 0" :datas="standardFiles" show-del class="mt-2" />
            <IlisUpload v-model:show="showFileModal" :max="1" :accept="['.pdf']" force @success="getFile" />
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
          <template v-if="showCheckInfo">
            <a-form-item label="验证人员" name="verificationUserName">
              <a-flex gap="6">
                <a-input
                  v-model:value="form.verificationUserName"
                  placeholder="请输入验证人员"
                  readonly
                />
                <div
                  v-if="form.verificationUserName"
                  class="absolute right-[76px] top-[6px] z-10 opacity-70 hover:opacity-100"
                >
                  <CloseCircleFilled
                    style="color:#aaa;cursor:pointer;"
                    @click="clearVerificationUser"
                  />
                </div>
                <a-button v-if="!isDetail" type="primary" @click="personVisible = true">
                  选择
                </a-button>
              </a-flex>
            </a-form-item>
            <a-form-item label="检测方法验证材料">
              <a-button class="flex items-center" @click="showUpload = true">
                <UploadOutlined />
                上传文件
              </a-button>
              <AttachmentList v-if="verificationFiles.length > 0" :datas="verificationFiles" show-del class="mt-2" />
            </a-form-item>
          </template>
        </a-form>
      </a-spin>
      <IlisUpload v-model:show="showUpload" :accept="['.pdf']" force multiple @success="getUploadFile" />
      <PersonSelector v-model:show="personVisible" @confirm="confirmSelectedPerson" />
    </ht-modal>

    <ht-modal
      v-model:open="standardVisible"
      title="选择规程"
      width="80%"
      destroy-on-close
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
  </div>
</template>

<script setup lang='ts'>
import type { SaveStandardParam } from '../api'
import type { Attachment } from '~/components/attachmentList'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CloseCircleFilled, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { inject, ref, unref } from 'vue'
import { AttachmentList } from '~/components/attachmentList'
import PersonSelector from '~/components/PersonSelector.vue'
import { BOOLEAN_DICT, BOOLEAN_OPT, STANDARD_TYPE, STANDARD_TYPE_DICT } from '../'
import { checkPublishCodeOnlyApi, saveStandardApi, standardDetailApi } from '../api'

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
const publishCodeOld = ref('')
const form = ref<SaveStandardParam>({
  standardTypeId: '',
  standardName: '',
  executeDate: '',
  whetherThisUnit: BOOLEAN_OPT.TRUE,
  type: STANDARD_TYPE.ALL,
  fileId: '',
  fileName: '',
  fileUrl: '',
  verificationUserId: '',
  verificationUserName: '',
})
const showCheckInfo = computed(() => {
  const { type, whetherThisUnit } = form.value
  return type !== STANDARD_TYPE.STANDARD && whetherThisUnit === BOOLEAN_OPT.TRUE
})

const standardFiles = ref<Attachment[]>([])
const verificationFiles = ref<Attachment[]>([])

// 获取数据
async function getData() {
  spinning.value = true
  try {
    const { data } = await standardDetailApi(editId.value)
    const { publishDate, executeDate, expireDate } = data.obj
    data.obj.publishDate = publishDate ? dayjs(publishDate).format('YYYY-MM-DD') : ''
    data.obj.executeDate = executeDate ? dayjs(executeDate).format('YYYY-MM-DD') : ''
    data.obj.expireDate = expireDate ? dayjs(expireDate).format('YYYY-MM-DD') : ''
    if (!data.obj.useType) {
      data.obj.useType = defaultType.value || STANDARD_TYPE.ALL
    }
    form.value = data.obj
    publishCodeOld.value = data.obj.publishCode
    if (data.obj.fileId) {
      standardFiles.value = [{
        id: data.obj.fileId,
        name: data.obj.fileName,
        url: data.obj.fileUrl,
      }]
    }
    verificationFiles.value = uploadFields(data.obj.verificationAttachment || [])
  }
  finally {
    spinning.value = false
  }
}
// 保存数据
const formRef = ref()
function standardCheck(obj: number) {
  const standardName = form.value.standardName
  if (obj === -1) {
    Modal.confirm({
      title: '提示',
      content: `当前规程未输入颁布号，是否继续${editId.value ? '编辑' : '添加'}规程?`,
      cancelText: '取消',
      okText: '确定',
      onOk: () => {
        saveData()
      },
    })
    return
  }
  if (obj > 0) {
    Modal.warning({
      title: '提示',
      content: '颁布号已存在',
      okText: '确定',
    })
  }
  else {
    if (!/^《.*》$/.test(standardName)) { // 颁布号唯一
      Modal.confirm({
        title: '提示',
        content: `当前规程有颁布号，请注意在规程名称前后加上书名号！是否继续${editId.value ? '编辑' : '添加'}规程?`,
        cancelText: '取消',
        okText: '确定',
        onOk: () => {
          saveData()
        },
      })
    }
    else {
      saveData()
    }
  }
}
async function checkPublishCodeOnly() {
  const publishCode = form.value.publishCode || ''
  const data = {
    publishCode,
    standardName: '',
  }
  const res = await checkPublishCodeOnlyApi(data)
  standardCheck(res.data.obj)
}
function handleEdit() {
  const publishCode = form.value.publishCode
  if (!publishCode) { // old可能为null，为"" ,原本的颁布号为空，无需进行唯一性判断
    // 颁布号为空，无需进行唯一性、书名号判断
    standardCheck(-1)
  }
  else if (publishCodeOld.value === publishCode) { // 无需进行唯一性判断，只需进行书名号判断
    standardCheck(0)
  }
  else if (publishCodeOld.value !== publishCode) { // 编辑改变颁布号，修改但不清空
    checkPublishCodeOnly()
  }
  else { // 编辑改变颁布号，清空，无需唯一性，书名号判断
    standardCheck(-1)
  }
}

function handleAdd() {
  const publishCode = form.value.publishCode
  if (!publishCode) {
    standardCheck(-1)
  }
  else {
    checkPublishCodeOnly()
  }
}
async function checkBeforeSave(editId: string) {
  formRef.value.validateFields().then(async () => {
    if (editId) {
      handleEdit()
    }
    else {
      handleAdd()
    }
  })
}
function saveData() {
  formRef.value.validateFields().then(async () => {
    const params: SaveStandardParam = {
      id: editId.value || '',
      // 选择模式下没有类型id，放到“未设置类型”中
      standardTypeId: defaultStandardType.value,
      standardName: form.value.standardName,
      publishCode: form.value.publishCode,
      publishDate: form.value.publishDate,
      executeDate: form.value.executeDate,
      expireDate: form.value.expireDate,
      fileId: standardFiles.value.length ? standardFiles.value[0].id : '',
      type: form.value.type,
      whetherThisUnit: form.value.whetherThisUnit,
    }

    // 验证信息
    if (showCheckInfo.value) {
      params.verificationAttachmentId = verificationFiles.value.map(item => item.id)
      params.verificationUserId = form.value.verificationUserId
    }

    // 新增
    if (!params.id) {
      params.replaceStandards = form.value.replaceStandards
      delete params.id
    }
    try {
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

function uploadFields(files: any[]) {
  return files.map(item => ({
    name: item.attachmenttitle || item.attachmentTitle,
    url: item.realpath,
    id: item.id,
  }))
}

// 上传规程文件
const showFileModal = ref(false)
// 上传规程文件回调
function getFile(files: any[]) {
  standardFiles.value = uploadFields(files)
}

// 上传检测方法验证材料
const showUpload = ref(false)
// 上传检测方法验证材料回调
function getUploadFile(files: any[]) {
  verificationFiles.value.push(...uploadFields(files))
}

// 选择验证人员
const personVisible = ref(false)
function confirmSelectedPerson(data: IUserSelectVoEntity[]) {
  form.value.verificationUserName = data[0].name
  form.value.verificationUserId = data[0].id
  personVisible.value = false
}
function clearVerificationUser() {
  form.value.verificationUserId = ''
  form.value.verificationUserName = ''
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
  standardFiles.value = []
  verificationFiles.value = []
  clearVerificationUser()
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
