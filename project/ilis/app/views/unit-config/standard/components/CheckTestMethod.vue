<template>
  <ht-modal
    v-model:open="visible"
    title="检测方法验证"
    widht="500px"
    :loading="loading"
    :confirm-loading="saveLoading"
    :after-close="onClosed"
    @ok="onOk"
    @cancel="onCancel"
  >
    <div class="pt-3 min-h-[30vh]">
      <a-form ref="formRef" :model="form" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="验证人员" name="verificationUserId">
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
            <a-button type="primary" @click="personVisible = true">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
        <a-form-item label="验证材料上传时间" name="lastUploadTime">
          <a-input v-model:value="form.lastUploadTime" disabled placeholder="请上传验证材料" />
        </a-form-item>
        <a-form-item label="检测方法验证材料">
          <a-button class="flex items-center" @click="showUpload = true">
            <UploadOutlined />
            上传文件
          </a-button>
          <AttachmentList v-if="verificationFiles.length > 0" show-del :datas="verificationFiles" class="mt-2" @delete="deleteFiles" />
        </a-form-item>
      </a-form>
    </div>

    <PersonSelector v-model:show="personVisible" @confirm="confirmSelectedPerson" />
    <IlisUpload v-model:show="showUpload" :accept="['.pdf']" force multiple @success="getUploadFile" />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { DataSource } from '../api'
import type { VerificationFunctionSet } from '../interface/SampleParamStandard'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { Attachment } from '~/components/attachmentList'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CloseCircleFilled, UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AttachmentList } from '~/components/attachmentList'
import PersonSelector from '~/components/PersonSelector.vue'
import { getVerificationFunction, verificationFunctionSet } from '../api'

const props = defineProps<IDialogPropsParam<null, DataSource>>()

const formRef = ref()
const visible = ref(true)
const loading = ref(false)
const saveLoading = ref(false)
const verificationFiles = ref<Attachment[]>([])
const form = ref<VerificationFunctionSet>({
  standardId: '',
  lastUploadTime: '',
  verificationUserName: '',
  verificationUserId: '',
})

onMounted(() => {
  getData()
})

async function getData() {
  try {
    loading.value = true
    const id = props.param.id
    const { data } = await getVerificationFunction(id)
    verificationFiles.value = uploadFields(data.verificationAttachment)
    form.value = data
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
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

// 上传检测方法验证材料
const showUpload = ref(false)
// 上传检测方法验证材料回调
function getUploadFile(files: any[]) {
  const file = files[files.length - 1]
  const { value } = useDateFormat(file.createDate, 'YYYY-MM-DD HH:mm:ss')
  form.value.lastUploadTime = value
  verificationFiles.value.push(...uploadFields(files))
}
function deleteFiles() {
  if (verificationFiles.value.length === 0) {
    form.value.lastUploadTime = ''
  }
}
// 处理上传文件字段
function uploadFields(files?: any[]) {
  if (!files)
    return []
  return files.map(item => ({
    name: item.attachmenttitle || item.attachmentTitle,
    url: item.realpath,
    id: item.id,
  }))
}

async function onOk() {
  try {
    saveLoading.value = true
    await formRef.value.validateFields()
    const attachmentIds = verificationFiles.value.map(item => item.id)
    await verificationFunctionSet({ ...form.value, attachmentIds })
    message.success('操作成功!')
    onCancel()
    props.onConfirm(null)
  }
  catch (err) {
    console.error(err)
  }
  saveLoading.value = false
}
function onCancel() {
  visible.value = false
}
</script>

<style>

</style>
