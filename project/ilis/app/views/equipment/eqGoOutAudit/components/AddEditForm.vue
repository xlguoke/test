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
        <a-input v-model:value="form.testTaskSn" placeholder="请选择关联任务" disabled />
        <a-button
          v-if="!!form.testTaskSn"
          @click="() => {
            form.testTaskSn = ''
            form.projectName = ''
            qualificationTypeArr = []
          }"
        >
          清空
        </a-button>
        <a-button @click="taskVisible = true">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item label="关联工程项目" name="projectName" :rules="[{ required: projectIsRequired, message: '请选择关联工程项目' }]">
      <a-flex gap="8">
        <a-input v-model:value.trim="form.projectName" placeholder="请选择工程项目或输入（多个用逗号分隔）" :disabled="!!form.testTaskSn" />
        <a-button v-if="!form.testTaskSn" @click="projectVisible = true">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item v-if="EQ_ENGINEERING_FIELD" label="资质类型" name="qualificationType">
      <a-select
        v-model:value="qualificationTypeArr"
        placeholder="请选择资质类型"
        :disabled="qualificationTypeDisabled"
        :options="form.testTaskSn ? allQualificationData : qualificationTypeData"
        :field-names="{ label: 'name', value: 'id' }"
        allow-clear
        mode="multiple"
      >
      </a-select>
    </a-form-item>
    <a-form-item label="借用人" name="borrowUser">
      <a-flex gap="8">
        <a-input v-model:value="form.borrowUser" disabled placeholder="请选择借用人" allow-clear />
        <a-button @click="personVisible = true">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item label="使用地点" name="location">
      <a-input v-model:value.trim="form.location" placeholder="请输入使用地点" />
    </a-form-item>
    <a-form-item label="外出时间" name="egressTime" :rules="[{ required: true, message: '请选择外出时间' }]">
      <a-date-picker
        v-model:value="form.egressTime"
        :value-format="FORMAT_TYPE"
        :show-time="EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS"
        placeholder="请选择外出时间"
        style="width: 100%;"
      />
    </a-form-item>
    <a-form-item label="预还时间" name="expectReturnTime" :rules="[{ required: EQUIPMENT_EGRESS_DATE, message: '请选择预还时间' }]">
      <a-date-picker
        v-model:value="form.expectReturnTime"
        :value-format="FORMAT_TYPE"
        :show-time="EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS"
        placeholder="请选择预还时间"
        style="width: 100%;"
      />
    </a-form-item>
    <a-form-item label="需求日期" name="requiredDate" :rules="[{ required: true, message: '请选择需求日期' }]">
      <a-date-picker
        v-model:value="form.requiredDate"
        value-format="YYYY-MM-DD"
        placeholder="请选择需求日期"
        style="width: 100%;"
      />
    </a-form-item>
    <a-form-item label="申请理由" name="reason" :rules="[{ required: true, message: '请输入申请理由' }]">
      <a-input v-model:value.trim="form.reason" :maxlength="500" placeholder="请输入申请理由" />
    </a-form-item>
    <a-form-item label="备注" name="remark">
      <a-input v-model:value.trim="form.remark" :maxlength="500" placeholder="请输入备注" />
    </a-form-item>
    <a-form-item label="附件上传" name="attachmentIds">
      <HtUploadFile
        :key="formData.id"
        :business-type="BUSINES_TYPE.EQ_EGRESS"
        force-init
        :business-id="formData.id"
        @get-qr-code-key="accessoriesQrCode = $event"
      />
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
import type { PropType } from 'vue'
import type { DetailData, SaveData } from '../api'
import type { ProjectData } from '~/components/selectedProject'
import type { TaskData } from '~/components/selectedTask'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import PersonSelector from '~/components/PersonSelector.vue'
import { SelectedProject } from '~/components/selectedProject'
import { SelectedTask } from '~/components/selectedTask'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import { getEgressApplySn, queryQualificationApi } from '../api'

const props = defineProps({
  formData: {
    type: Object as PropType<DetailData>,
    default: () => ({}),
  },
})

const accessoriesQrCode = ref('')

/** 业务控制参数：控制预还时间是否必填 */
const EQUIPMENT_EGRESS_DATE = ref(false)

// 获取业务控制参数 按照关联项目显示外出设备
const OUT_EQUIPMENT_LIMIT_SELECT = ref(false)
const EQ_ENGINEERING_FIELD = ref(false)

/** 业务控制参数：控制外出时间、预还时间是否显示时分秒 */
const EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS = ref(false)

/** 时间格式类型，根据系统控制参数动态计算 */
const FORMAT_TYPE = 'YYYY-MM-DD HH:mm:ss'
const form = ref<SaveData>({
  egressApplySn: '',
  egressTime: '',
  borrowUserId: '',
  equipmentIds: [],
  requiredDate: '',
})
const qualificationType = ref('')
const qualificationTypeArr = ref<string[]>([])

const qualificationTypeData = ref<any[]>([])
const allQualificationData = ref<any[]>([])

const projectIsRequired = computed(() => localStorage.unitCode === 'hxcd' || OUT_EQUIPMENT_LIMIT_SELECT.value)
const checkedIds = computed(() => form.value.borrowUserId ? [form.value.borrowUserId] : [])

const selTestTaskSn = ref<string[]>([])

onMounted(async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  form.value.borrowUser = userInfo.realName || userInfo.username
  form.value.borrowUserId = userInfo.userId
  OUT_EQUIPMENT_LIMIT_SELECT.value = await getBusinessParam('OUT_EQUIPMENT_LIMIT_SELECT')
  EQUIPMENT_EGRESS_DATE.value = await getBusinessParam('EQUIPMENT_EGRESS_DATE')
  EQ_ENGINEERING_FIELD.value = await getBusinessParam('EQ_ENGINEERING_FIELD')
  EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS.value = await getBusinessParam('EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS')
  await Promise.all([
    getqualificationTypeData(),
    getqualificationTypeDataAll(),
  ])
})

watch(() => props.formData, (fData) => {
  if (!fData.id)
    return
  form.value = {
    id: fData.id,
    egressApplySn: fData.egressApplySn,
    testTaskSn: fData.testTaskSn,
    projectName: fData.projectName,
    borrowUser: fData.borrowUser,
    borrowUserId: fData.borrowUserId,
    egressTime: fData.egressTime ? dayjs(fData.egressTime).format(FORMAT_TYPE) : '',
    expectReturnTime: fData.expectReturnTime ? dayjs(fData.expectReturnTime).format(FORMAT_TYPE) : '',
    remark: fData.remark,
    qrKey: fData.qrKey,
    equipmentIds: [],
    location: fData.location,
    requiredDate: fData.requiredDate ? dayjs(fData.requiredDate).format('YYYY-MM-DD') : '',
    reason: fData.reason,
  }

  qualificationType.value = fData.qualificationType || ''
  qualificationTypeArr.value = fData.qualificationType ? fData.qualificationType.split(',') : []
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
 * 获取资质类型数据
 */
async function getqualificationTypeData() {
  const { data } = await queryQualificationApi(0)
  qualificationTypeData.value = data.rows || []
}
async function getqualificationTypeDataAll() {
  const { data } = await queryQualificationApi(1)
  allQualificationData.value = data.rows || []
}
/**
 * 选择任务
 */
const taskVisible = ref(false)

const uniqueQualificationIds = ref<string[]>([])
const qualificationTypeDisabled = computed(() => !!form.value.testTaskSn)
function getTask(tasks: TaskData[]) {
  uniqueQualificationIds.value = Array.from(
    new Set(
      tasks.flatMap((task) => {
        const idStr = task.qualificationTypeId || ''
        return idStr.split(',').map(id => id.trim()).filter(id => id)
      }),
    ),
  )
  qualificationTypeArr.value = [...uniqueQualificationIds.value]
  taskVisible.value = false
  if (tasks.length === 0) {
    form.value.testTaskSn = ''
    form.value.projectName = ''
    return
  }

  const testTaskSnArr: string[] = []
  const projectNameArr: string[] = []

  tasks.forEach((item: TaskData) => {
    if (!testTaskSnArr.includes(item.testTaskCode)) {
      testTaskSnArr.push(item.testTaskCode)
    }

    if (!projectNameArr.includes(item.projectName)) {
      projectNameArr.push(item.projectName)
    }
  })

  form.value.testTaskSn = testTaskSnArr.join(',')
  form.value.projectName = projectNameArr.join(',')
}

/**
 * 工程项目去重
 */
function handleProjectName(val: string) {
  if (val) {
    const arr = val.split(',')
    return Array.from(new Set(arr)).join(',')
  }
  return val
}

/**
 * 选择工程项目
 */
const projectVisible = ref(false)
function getProject(datas: ProjectData[]) {
  projectVisible.value = false

  if (datas.length === 0) {
    form.value.projectName = ''
    return
  }

  const pNameArr = form.value.projectName ? form.value.projectName.replace(/，/g, ',').split(',') : []
  datas.forEach((item) => {
    if (!pNameArr.includes(item.name)) {
      pNameArr.push(item.name)
    }
  })

  form.value.projectName = pNameArr.join(',')
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
    const formData: SaveData = {
      ...form.value,
      projectName: handleProjectName((form.value.projectName || '').replace(/，/g, ',')),
    }

    if (formData.expectReturnTime && formData.egressTime && new Date(formData.expectReturnTime).valueOf() <= new Date(formData.egressTime).valueOf()) {
      message.warning('预还时间必须要大于外出时间')
      return ''
    }
    if (formData.egressTime && new Date().valueOf() >= new Date(formData.egressTime).valueOf()) {
      const isSave = await confirmSubmit()
      if (!isSave)
        return ''
    }
    formData.qrKey = accessoriesQrCode.value
    return {
      ...formData,
      qualificationType: qualificationTypeArr.value.join(','),
    }
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
