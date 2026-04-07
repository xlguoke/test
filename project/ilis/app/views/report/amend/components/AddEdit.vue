<template>
  <a-spin :spinning="loading">
    <div class="min-h-[650px]">
      <BaseTitle>报告信息</BaseTitle>
      <a-descriptions
        bordered size="small"
        :column="2"
        :label-style="{ textAlign: 'center' }"
        :content-style="{ width: '280px' }"
      >
        <a-descriptions-item label="报告编号" :content-style="{ padding: 0 }">
          <a-flex align="center">
            <span class="flex-1 w-0 px-3" :title="formState.reportCode">{{ formState.reportCode }}</span>
            <a-button v-if="!unSelectedReport && !disabled && !editId" type="primary" @click="openReportSelector">
              <EllipsisOutlined />
            </a-button>
          </a-flex>
        </a-descriptions-item>
        <a-descriptions-item label="项目负责人">
          {{ formState.principal }}
        </a-descriptions-item>
        <a-descriptions-item label="发出份数">
          {{ formState.issueQty || 0 }}
        </a-descriptions-item>
        <a-descriptions-item label="发出日期">
          {{ formState.issueDate }}
        </a-descriptions-item>
        <a-descriptions-item label="收回份数" :content-style="{ padding: '1px' }">
          <span v-if="disabled" class="px-3">
            {{ formState.recycleQty }}
          </span>
          <a-input-number
            v-else
            v-model:value="formState.recycleQty"
            :controls="false"
            :precision="0"
            :min="0"
            :max="formState.issueQty"
            class="w-full"
          />
        </a-descriptions-item>
        <a-descriptions-item label="销毁份数" :content-style="{ padding: '1px' }">
          <span v-if="disabled" class="px-3">
            {{ formState.destructionQty }}
          </span>
          <a-input-number
            v-else
            v-model:value="formState.destructionQty"
            :controls="false"
            :precision="0"
            :min="0"
            :max="formState.issueQty"
            class="w-full"
          />
        </a-descriptions-item>
      </a-descriptions>

      <BaseTitle class="mt-4">
        申请信息
      </BaseTitle>
      <a-form ref="formRef" :disabled="disabled" :model="formState" :label-col="labelCol">
        <a-form-item
          label="申请人" name="applicant" :maxlength="50"
          :rules="[{ required: true, message: '请输入申请人' }]"
        >
          <a-input v-model:value="formState.applicant" placeholder="请输入申请人" />
        </a-form-item>
        <a-form-item
          label="申请日期" name="applicationDate"
          :rules="[{ required: true, message: '请选择申请日期' }]"
        >
          <a-date-picker
            v-model:value="formState.applicationDate"
            value-format="YYYY-MM-DD" class="w-full"
            placeholder="请选择申请日期"
          />
        </a-form-item>
        <a-form-item
          label="申请说明"
          name="applicationDescription"
          :rules="[{ required: true, message: '请输入申请说明', trigger: 'change' }]"
        >
          <DataDict
            v-model:value="applicationDescription"
            code="R:A:A:D"
            mode="tags"
            placeholder="请输入申请说明（输入内容后回车可添加自定义项）"
            @change="(v) => formState.applicationDescription = v ? v.toString() : ''"
          />
        </a-form-item>
      </a-form>

      <!-- 自定义字段 -->
      <IlisCustomPropertiesForm
        ref="customFormRef"
        :key="formState.id || '1'"
        :disabled="disabled"
        :customize-type="CUSTOMMIZE_TYPE"
        :cols="1"
        :label-col="labelCol"
        :default-value="defaultCustoms"
      />

      <a-form :disabled="disabled" :label-col="labelCol">
        <a-form-item label="附件">
          <a-flex vertical gap="small">
            <AttachmentList
              v-if="disabled || fileList.length > 0"
              :datas="fileList"
              :show-del="!disabled"
            />
            <a-button v-if="!disabled" class="w-[110px]" @click="uploadVisible = true">
              <UploadOutlined />
              上传附件
            </a-button>
          </a-flex>

          <IlisUpload v-if="!disabled" v-model:show="uploadVisible" multiple force @success="handleUploadSuccess" />
        </a-form-item>
      </a-form>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
import type { SaveData } from '../api'
import type { WaitAmendReportEntity } from '../ReportAmendEntity'
import type { Attachment } from '~/components/attachmentList'
import type { IProcessForm } from '~/components/commonProcess'
import { EllipsisOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { AttachmentList } from '~/components/attachmentList'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import { detailApi, saveApi, submitApi } from '../api'
import { CUSTOMMIZE_TYPE } from '../ReportAmendEntity'
import ReportSelector from './ReportSelector.vue'

export interface ReportInfo {
  consignCode: string
  consignUnit: string
  reportCode: string
  reportId: string
  issueDate: string
  issueQty: number
  principal: string
}

const props = defineProps<{
  id?: string
  disabled?: boolean
  reportInfo?: ReportInfo
  unSelectedReport?: boolean
}>()

const loading = ref(false)
const labelCol = { style: { width: '100px' } }
const formRef = ref()
const customFormRef = ref()
const editId = ref('')
const formState = ref<SaveData>({
  reportId: '',
  consignUnit: '',
  consignCode: '',
  reportCode: '',
  applicant: '',
  applicationDate: '',
  applicationDescription: '',
  customs: [],
})
const applicationDescription = ref([])
const fileList = ref<Attachment[]>([])
const defaultCustoms = ref([])

onMounted(() => {
  if (props.reportInfo) {
    initReportInfo(props.reportInfo)
  }
  getDetail()
})

function initReportInfo(info: ReportInfo) {
  const count = Number(info.issueQty || 0)
  formState.value = {
    ...formState.value,
    ...info,
    recycleQty: count,
    destructionQty: count,
  }
}

async function getDetail() {
  if (!props.id)
    return

  try {
    loading.value = true
    const { data } = await detailApi({
      id: props.id,
    })

    formState.value = data
    if (data.applicationDescription) {
      applicationDescription.value = data.applicationDescription.split(',')
    }
    editId.value = props.id
    defaultCustoms.value = data.customs.map((d: any) => ({
      columnId: d.customColumnId,
      columnValue: d.customColumnValue,
      columnName: d.customColumnName,
    }))
    fileList.value = data.attachments.map((d: any) => ({
      name: d.attachmentTitle,
      id: d.id,
      url: d.realpath,
    }))
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}

/** 选择报告 */
async function openReportSelector() {
  const data: WaitAmendReportEntity = await AnyDialogHelper.showModel(ReportSelector, {
    reportId: formState.value.reportId,
  })
  const count = Number(data.issueQty || 0)
  formState.value = {
    ...formState.value,
    ...data,
    issueQty: count,
    recycleQty: count,
    destructionQty: count,
  }
}

// 上传附件
const uploadVisible = ref(false)
function handleUploadSuccess(data: any[]) {
  const files = data.map((d) => {
    return {
      name: d.attachmenttitle,
      id: d.id,
      url: d.realpath,
    }
  })
  fileList.value.push(...files)
}
// 保存
async function save(flag?: boolean) {
  if (!formState.value.reportId) {
    message.warning('请选择报告')
    throw new Error('请选择报告')
  }
  await formRef.value.validateFields()
  const customs = await customFormRef.value.getFormData()
  const { data } = await saveApi({
    id: editId.value,
    ...formState.value,
    customs: customs.map((d: any) => ({
      customColumnId: d.columnId,
      customColumnValue: d.columnValue ? d.columnValue.toString() : '',
      customColumnName: d.columnName,
    })),
    attachments: fileList.value.map(d => d.id),
  })

  if (!editId.value) {
    editId.value = data
  }

  if (flag)
    return editId.value

  message.success('保存成功!')
}

/** 提交申请 */
async function submit(id: string) {
  const propParam: IProcessForm = {
    processType: ProcessType.REPORT_AMEND,
    processId: id,
    submitAuditApi: submitApi,
    submitDataTransfer: (data) => {
      const params = {
        processForm: JSON.parse(data.formPropertyJson),
        presetAuditors: JSON.parse(data.presetAuditers),
        id,
      }
      return params
    },
  }
  await AnyDialogHelper.showModel(ProcessModal, propParam)
  message.success('提交成功')
}

defineExpose({
  save,
  submit,
})

window.reportAmendInitReportInfo = initReportInfo
window.reportAmendSave = save
window.reportAmendSubmit = submit
</script>

<style scoped>
:deep(.ant-select-multiple .ant-select-selection-item),
:deep(.ant-select-dropdown .ant-select-item-option){
  align-items: center;
}
</style>
