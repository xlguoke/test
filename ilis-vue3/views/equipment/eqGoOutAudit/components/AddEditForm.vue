<template>
  <a-form ref="formRef" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
    <a-form-item label="外出申请单号" name="egressApplySn">
      <a-flex gap="8">
        <a-input v-model:value="form.egressApplySn" disabled placeholder="请获取外出申请单号" />
        <a-button v-if="!form.id" :loading="snLoading" @click="getApplySn">
          获取
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item label="关联任务" name="testTaskSn">
      <a-flex gap="8">
        <a-select
          v-model:value="selTestTaskSn"
          mode="multiple"
          style="width: 100%"
          placeholder="请选择关联任务"
          :options="taskSnOpts"
          @change="(v: any) => {
            taskSnOpts = taskSnOpts.filter(d => v.includes(d.value))
          }"
        ></a-select>
        <a-button @click="taskVisible = true">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item label="关联工程项目" name="projectIds" :rules="[{ required: projectIsRequired, message: '请选择关联工程项目' }]">
      <a-flex gap="8">
        <a-select
          v-model:value="form.projectIds"
          mode="multiple"
          style="width: 100%"
          placeholder="请选择关联工程项目"
          :options="projectOpts"
          @change="(v: any) => {
            projectOpts = projectOpts.filter(d => v.includes(d.value))
          }"
        ></a-select>
        <a-button @click="projectVisible = true">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item label="借用人" name="borrowUser">
      <a-flex gap="8">
        <a-input v-model:value="form.borrowUser" disabled placeholder="请选择借用人" />
        <a-button @click="personVisible = true">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item label="外出时间" name="egressTime" :rules="[{ required: true, message: '请选择外出时间！' }]">
      <a-date-picker
        v-model:value="form.egressTime"
        :value-format="FORMAT_TYPE"
        show-time
        placeholder="请选择外出时间"
        style="width: 100%;"
      />
    </a-form-item>
    <a-form-item label="预还时间" name="expectReturnTime">
      <a-date-picker
        v-model:value="form.expectReturnTime"
        :value-format="FORMAT_TYPE"
        show-time
        placeholder="请选择预还时间"
        style="width: 100%;"
      />
    </a-form-item>
    <a-form-item label="备注" name="remark">
      <a-input v-model:value="form.remark" placeholder="请输入备注" />
    </a-form-item>
    <a-form-item label="附件上传" name="attachmentIds">
      <a-upload :multiple="true" :file-list="fileList" :action="uploadUrl" @change="handleChange">
        <a-button>
          <UploadOutlined />选择文件
        </a-button>
        <span style="font-size:12px;margin-left:20px;color: #5ab266;">请上传小于500M的文件</span>
      </a-upload>
    </a-form-item>
  </a-form>

  <!-- 选择任务 -->
  <SelectedTask v-model:open="taskVisible" multiple :payload="{ testTaskStatus: 20 }" @ok="getTask" />
  <!-- 选择工程项目 -->
  <SelectedProject v-model:open="projectVisible" multiple @ok="getProject" />
  <!-- 选择人员 -->
  <PersonSelector v-model:show="personVisible" :checked-ids="checkedIds" @confirm="getPerson" />
</template>

<script setup lang='ts'>
import { UploadOutlined } from '@ant-design/icons-vue'
import type { UploadFile } from 'ant-design-vue'
import { Modal, message } from 'ant-design-vue'
import type { PropType } from 'vue'
import dayjs from 'dayjs'
import { getEgressApplySn } from '../api'
import type { DetailData, SaveData } from '../api'
import { SelectedTask, type TaskData } from '~/components/selectedTask'
import { type ProjectData, SelectedProject } from '~/components/selectedProject'
import PersonSelector from '~/components/PersonSelector.vue'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'

interface Option {
  label: string
  value: string
}

const props = defineProps({
  formData: {
    type: Object as PropType<DetailData>,
    default: () => ({}),
  },
})

// 获取业务控制参数 按照关联项目显示外出设备
const OUT_EQUIPMENT_LIMIT_SELECT = ref(false)
const FORMAT_TYPE = 'YYYY-MM-DD HH:mm:ss'
const form = ref<SaveData>({
  egressApplySn: '',
  egressTime: '',
  borrowUserId: '',
  equipmentIds: [],
})

const projectIsRequired = computed(() => localStorage.unitCode === 'hxcd' || OUT_EQUIPMENT_LIMIT_SELECT.value)
const checkedIds = computed(() => form.value.borrowUserId ? [form.value.borrowUserId] : [])

const selTestTaskSn = ref<string[]>([])
const taskSnOpts = ref<Option[]>([])
const projectOpts = ref<Option[]>([])
const fileList = ref<UploadFile[]>([])
const uploadUrl = `${import.meta.env.VITE_ILIS_BASE}/uploadController.do?upload`

onMounted(async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  form.value.borrowUser = userInfo.realName || userInfo.username
  form.value.borrowUserId = userInfo.userId
  OUT_EQUIPMENT_LIMIT_SELECT.value = await getBusinessParam('OUT_EQUIPMENT_LIMIT_SELECT')
})

watch(() => props.formData, (fData) => {
  if (!fData.id)
    return
  form.value = {
    id: fData.id,
    egressApplySn: fData.egressApplySn,
    testTaskSn: fData.testTaskSn,
    projectIds: fData.projects.map(d => d.projectId),
    borrowUser: fData.borrowUser,
    borrowUserId: fData.borrowUserId,
    egressTime: fData.egressTime ? dayjs(fData.egressTime).format(FORMAT_TYPE) : '',
    expectReturnTime: fData.expectReturnTime ? dayjs(fData.expectReturnTime).format(FORMAT_TYPE) : '',
    remark: fData.remark,
    attachmentIds: fData.attachments?.map(d => d.attachmentId),
    equipmentIds: [],
  }
  const testTaskSns = fData.testTaskSn ? fData.testTaskSn.split(',') : []
  taskSnOpts.value = testTaskSns.map(d => ({ label: d, value: d }))
  projectOpts.value = fData.projects.map(d => ({ label: d.projectName, value: d.projectId }))
  fileList.value = fData.attachments.map(d => ({
    uid: d.attachmentId,
    name: d.attachmentTitle,
    status: 'done',
    url: d.attachmentUrl,
  }))
})

watch(() => form.value.testTaskSn, (sn) => {
  selTestTaskSn.value = sn ? sn.split(',') : []
})

/**
 * 获取申请单号
 */
const snLoading = ref(false)
async function getApplySn() {
  try {
    snLoading.value = true
    const { data } = await getEgressApplySn()
    form.value.egressApplySn = data
  }
  finally {
    snLoading.value = false
  }
}

/**
 * 选择任务
 */
const taskVisible = ref(false)
function getTask(tasks: TaskData[]) {
  taskVisible.value = false
  if (tasks.length === 0)
    return ''
  for (let i = 0; i < tasks.length; i++) {
    const item = tasks[i]
    const isTask = taskSnOpts.value.find(d => d.value === item.testTaskCode)
    if (isTask)
      continue

    taskSnOpts.value.push({
      label: item.testTaskCode,
      value: item.testTaskCode,
    })

    const isProject = projectOpts.value.find(d => d.value === item.projectId)
    if (!isProject) {
      projectOpts.value.push({
        label: item.projectName,
        value: item.projectId,
      })
    }
  }
  form.value.testTaskSn = taskSnOpts.value.map(d => d.value).join(',')
  form.value.projectIds = projectOpts.value.map(d => d.value)
}

/**
 * 选择工程项目
 */
const projectVisible = ref(false)
function getProject(datas: ProjectData[]) {
  projectVisible.value = false
  if (datas.length === 0)
    return ''
  for (let i = 0; i < datas.length; i++) {
    const item = datas[i]
    const isProject = projectOpts.value.find(d => d.value === item.id)
    if (isProject)
      continue
    projectOpts.value.push({
      label: item.name,
      value: item.id,
    })
  }
  form.value.projectIds = projectOpts.value.map(d => d.value)
}

/**
 * 选择人员
 */
const personVisible = ref(false)
function getPerson(datas: IUserSelectVoEntity[]) {
  personVisible.value = false
  if (datas.length === 0)
    return ''
  form.value.borrowUser = datas[0].name
  form.value.borrowUserId = datas[0].id
}

/**
 * 上传附件
 */
function handleChange({ fileList: files }: { fileList: UploadFile[] }) {
  const fileIds: string[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const res = file.response
    if (file.status !== 'done')
      continue
    if (res.success && res.obj.length) {
      fileIds.push(res.obj[0].id)
    }
    else {
      file.status = 'error'
    }
  }
  fileList.value = files
  form.value.attachmentIds = fileIds
}

async function confirmSubmit() {
  return new Promise((resolve) => {
    Modal.confirm({
      title: '请确认外出时间!',
      content: `外出时间（${form.value.egressTime}）小于当前系统时间，请确认是否继续提交？`,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        resolve(true)
      },
      onCancel() {
        resolve(false)
      },
    })
  })
}

const formRef = ref()
async function getFormData() {
  try {
    await formRef.value.validateFields()
    const formData: SaveData = { ...form.value }

    if (formData.expectReturnTime && formData.egressTime && new Date(formData.expectReturnTime).valueOf() <= new Date(formData.egressTime).valueOf()) {
      message.warning('预还时间必须要大于外出时间')
      return ''
    }
    if (formData.egressTime && new Date().valueOf() >= new Date(formData.egressTime).valueOf()) {
      const isSave = await confirmSubmit()
      if (!isSave)
        return ''
    }

    return formData
  }
  catch (err) {
    console.error(err)
    return ''
  }
}

defineExpose({
  getFormData,
})
</script>

<style>

</style>
