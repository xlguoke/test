<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="640px"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    :after-close="onClosed"
    @cancel="cancel"
  >
    <BaseSpinWrapper :spinning="loading">
      <div v-if="!equipmentId" class="my-4">
        <template v-if="record">
          <BaseTitle>设备信息</BaseTitle>
          <div class="pl-3">
            <p>设备名称：{{ record.equipmentName }}</p>
            <p>设备编号：{{ record.equipmentCode }}</p>
          </div>
        </template>
        <template v-else>
          <BaseTitle>设备列表</BaseTitle>
          <a-table
            :data-source="equipmentList"
            :columns="columns"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, index }">
              <template v-if="column.dataIndex === 'actions'">
                <a-button type="link" danger @click="removeRow(index)">
                  移除
                </a-button>
              </template>
            </template>
          </a-table>
          <a-button type="dashed" class="w-full mt-2" @click="addEquipment">
            <PlusOutlined />选择设备
          </a-button>
        </template>
      </div>

      <BaseTitle>使用记录</BaseTitle>

      <a-form ref="formRef" :model="formState" class="pt-4 w-[98%]" :label-col="{ style: 'width: 110px' }" :wrapper-col="{ style: 'flex: 1' }">
        <a-form-item label="开始使用时间" name="startUseTime" :rules="[{ required: true, message: '请选择开始使用时间！' }]">
          <a-date-picker v-model:value="formState.startUseTime" show-time placeholder="请选择" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS"></a-date-picker>
        </a-form-item>
        <a-form-item label="使用前状态" name="startUseState">
          <a-select v-model:value="formState.startUseState" :options="useStateOptions" placeholder="请选择"></a-select>
        </a-form-item>
        <a-form-item label="结束使用时间" name="endUseTime">
          <a-date-picker v-model:value="formState.endUseTime" show-time placeholder="请选择" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS"></a-date-picker>
        </a-form-item>
        <a-form-item label="使用后状态" name="endUseState">
          <a-select v-model:value="formState.endUseState" :options="useStateOptions" placeholder="请选择"></a-select>
        </a-form-item>
        <a-form-item label="关联任务" name="testTaskCode">
          <a-flex gap="8">
            <a-input v-model:value.trim="formState.testTaskCode" placeholder="请选择或输入关联任务" :disabled="!eqIds.length" @blur="onChangeTestTask" />
            <a-button @click="onSelectTask">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
        <a-form-item label="资质类型">
          <a-select
            v-model:value="qualificationType"
            placeholder="请选择资质类型"
            :options="qualificationOptions"
            allow-clear
            mode="multiple"
            :disabled="isSystemTestTask"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="工程项目" name="projectName">
          <a-input v-model:value="formState.projectName" :disabled="isSystemTestTask" placeholder="请输入工程项目" />
        </a-form-item>
        <a-form-item label="样品编号" name="testObjectCode">
          <a-input v-model:value="formState.testObjectCode" :disabled="isSystemTestTask" placeholder="请输入样品编号" />
        </a-form-item>
        <a-form-item v-if="isSystemTestTask" label="检测参数" name="testTaskParamName" :rules="[{ required: true, message: '请选择开始使用时间！' }]">
          <a-select
            v-model:value="formState.testTaskParamId"
            placeholder="请选择检测参数"
            :options="testParamOptions"
            allow-clear
            @change="(val, row) => {
              formState.testTaskParamName = row ? row.label : ''
            }"
          >
          </a-select>
        </a-form-item>
        <a-form-item v-else label="检测参数" name="testTaskParamName">
          <a-input v-model:value.trim="formState.testTaskParamName" placeholder="请输入检测参数" />
        </a-form-item>
        <a-form-item v-if="EQUIPMENT_USE_RECORD_USER && formState.testTaskId" label="使用人" name="userId" :rules="[{ required: true, message: '请选择使用人！' }]">
          <a-select
            v-model:value="formState.userId"
            placeholder="请选择使用人"
            :options="userOptions"
            allow-clear
            @change="(val, row) => {
              formState.userName = row ? row.label : ''
            }"
          />
        </a-form-item>
        <a-form-item v-else label="使用人" name="userName" :rules="[{ required: true, message: '请输入使用人！' }]">
          <a-input v-model:value.trim="formState.userName" placeholder="请输入使用人" />
        </a-form-item>
        <a-form-item label="使用地点" name="usePlace">
          <a-input v-model:value.trim="formState.usePlace" placeholder="请输入使用地点" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value.trim="formState.remark" :rows="2" :maxlength="500" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </BaseSpinWrapper>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>

    <!-- 选择设备 -->
    <DeviceSelector
      v-model:show="eqVisible"
      multiple
      :payload="{ egressStatus: '10,30' }"
      show-sub-device
      @confirm="selectedEquipment"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { AddEqUseRecordEntity, UpdateEqUseRecordEntity } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { TestTaskDetailDTO, TestTaskListItemDTO, TestTaskParamListItemDTO, TestTaskPerson } from '~/api/test/test-task/types'
import type { IDeviceEntity } from '~/interface/IDeviceEntity.ts'
import type { IOption } from '~/interface/IOption'
import type { EquipmentUsageRecordEntity } from '~/views/equipment/usage-record/EquipmentUsageRecordEntity.ts'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { getTestTaskDetail, getTestTaskList, getTestTaskParamList, getTestTaskPerson } from '~/api/test/test-task'
import DeviceSelector from '~/components/DeviceSelector.vue'
import TaskSelector from '~/components/selectorViaMethodCall/TaskSelector.vue'
import { queryQualificationApi } from '../../../equipmentNew/egress/eqEgressList/list/api'
import { addEqUseRecord, getEqAuthInfo, updateEqUseRecord } from '../api'

const props = defineProps<IDialogPropsParam<null, {
  record?: EquipmentUsageRecordEntity
  equipmentId?: string
}>>()

const useStateOptions = [
  { label: '正常', value: '正常' },
  { label: '不正常', value: '不正常' },
]

const formRef = ref()

const record = computed(() => props.param.record)

const equipmentId = computed(() => props.param.equipmentId)

const open = ref(true)

const formState = ref<AddEqUseRecordEntity | UpdateEqUseRecordEntity>({})

const qualificationType = ref<string[]>([])

const submitLoading = ref(false)

const equipmentList = ref<any[]>([])

const eqVisible = ref(false)

const qualificationOptions = ref<{
  id: string
  name: string
  isDelete?: boolean
}[]>([])

const testParamOptions = ref<IOption[]>([])

const userOptions = ref<IOption[]>([])

const isSystemTestTask = ref(false)

const EQUIPMENT_USE_RECORD_USER = ref(false)

const allQualificationData = ref([])

const loading = ref(false)

const testTaskDetail = ref<TestTaskDetailDTO>()

const columns = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '操作',
    dataIndex: 'actions',
  },
]

const title = computed(() => {
  if (record.value) {
    return '编辑设备使用记录'
  }

  return '新增设备使用记录'
})

const testPersons = computed(() => {
  if (testTaskDetail.value) {
    return testTaskDetail.value.testTaskPersons.filter((i: TestTaskPerson) => i.type === '0')
  }
  return []
})

const eqIds = computed(() => {
  if (equipmentId.value) {
    return [equipmentId.value]
  }
  if (record.value) {
    return [record.value.equipmentId]
  }
  return equipmentList.value.map(i => i.id)
})

init()

async function init() {
  await getBusinessParam('EQUIPMENT_USE_RECORD_USER').then((val) => {
    EQUIPMENT_USE_RECORD_USER.value = val
  })

  await queryQualificationApi(1).then((res) => {
    allQualificationData.value = res.data.rows
  })

  await loadQualificationOptions()

  if (record.value) {
    const data = record.value
    formState.value.startUseTime = data.startUseTime
    formState.value.endUseTime = data.endUseTime
    formState.value.startUseState = data.startUseState
    formState.value.endUseState = data.endUseState
    if (!EQUIPMENT_USE_RECORD_USER.value || (EQUIPMENT_USE_RECORD_USER.value && !data.testTaskId)) {
      formState.value.userName = data.userName
    }
    formState.value.usePlace = data.usePlace
    formState.value.remark = data.remark
    formState.value.testTaskId = data.testTaskId || ''
    formState.value.oTestTaskId = data.testTaskId || ''
    formState.value.testTaskCode = data.testTaskCode
    formState.value.projectName = data.projectName
    formState.value.testObjectCode = data.testObjectCode
    formState.value.testTaskParamId = data.taskParamId || undefined
    formState.value.oTestTaskParamId = data.taskParamId || undefined
    formState.value.testTaskParamName = data.testParamDisplayName
    const quaIdArr = data.qualificationType ? data.qualificationType.split(',') : []
    qualificationType.value = quaIdArr
    getSelectedQualification(quaIdArr)
    isSystemTestTask.value = !!data.testTaskId

    loadTestParamOptions()
    loadUserOptions()
  }
}

// 加载试验检测参数下拉
async function loadTestParamOptions() {
  if (formState.value.testTaskId) {
    const res = await getTestTaskParamList(formState.value.testTaskId)
    testParamOptions.value = res.data.obj.map((item: TestTaskParamListItemDTO) => ({
      label: item.displayName,
      value: item.taskParamId,
    }))
  }
}

// 加载资质下拉
async function loadQualificationOptions() {
  const res = await queryQualificationApi()
  qualificationOptions.value = res.data.rows.map((i: any) => ({
    label: i.name,
    value: i.id,
  }))
}

// 编辑时加载人员下拉
async function loadUserOptions() {
  if (record.value && record.value.testTaskId) {
    const testPersonRes = await getTestTaskPerson(record.value.testTaskId)
    const authPersonRes = await getEqAuthInfo(record.value.equipmentId)

    const tPerson = testPersonRes.data.filter(i => i.type === '0')

    if (authPersonRes.data.auth) {
      const aPerson = authPersonRes.data.authUserList || []
      userOptions.value = tPerson.filter(i => aPerson.includes(i.userId)).map(i => ({
        label: i.name,
        value: i.userId,
      }))
    }
    else {
      userOptions.value = tPerson.map(i => ({
        label: i.name,
        value: i.userId,
      }))
    }
  }
}

// 手动变更试验
async function onChangeTestTask() {
  if (!formState.value.testTaskCode) {
    setIsSystemTestTask(false)
    return
  }

  loading.value = true
  const res = await getTestTaskList({
    page: 1,
    rows: 999,
    type: 1,
    queryScope: 'user',
    dataType: 1,
    quickQryParam: formState.value.testTaskCode,
  }).finally(() => {
    loading.value = false
  })

  const rows = res.data.rows

  if (rows.length > 0) {
    const item = rows.find(i => i.testTaskCode === formState.value.testTaskCode)
    if (item) {
      setTestTask(item, () => {
        formState.value.testTaskCode = ''
      })
      return
    }
  }

  setIsSystemTestTask(false)
}

/** 选择设备 */
function addEquipment() {
  eqVisible.value = true
}

/** 选择设备回调 */
async function selectedEquipment(datas: IDeviceEntity[]) {
  eqVisible.value = false
  const addEqs: Array<{
    id: string
    equipmentName: string
    equipmentSn: string
    standard: string
  }> = []
  for (let i = 0; i < datas.length; i++) {
    const d = datas[i]
    const item = equipmentList.value.find(e => e.id === d.id)
    if (!item) {
      addEqs.push({
        id: d.id,
        equipmentName: d.name,
        equipmentSn: d.equipmentSn,
        standard: d.standard,
      })
    }
  }

  if (formState.value.testTaskId) {
    const newEqList = [...equipmentList.value, ...addEqs]
    if (!await checkEqAuthUser(newEqList.map(i => i.id), testPersons.value, '设备')) {
      return
    }
  }

  equipmentList.value.push(...addEqs)
}

/** 删除已选择的设备 */
async function removeRow(ind: number) {
  equipmentList.value.splice(ind, 1)

  if (!equipmentList.value.length) {
    formState.value.testTaskCode = ''
    setIsSystemTestTask(false)
  }
}

// 设置是否为系统测试任务
function setIsSystemTestTask(val: boolean) {
  if (!val) {
    formState.value.testTaskId = ''
    formState.value.testObjectCode = ''
    formState.value.projectName = ''
    formState.value.testTaskParamId = undefined
    formState.value.testTaskParamName = ''
    if (EQUIPMENT_USE_RECORD_USER.value) {
      formState.value.userId = undefined
      formState.value.userName = ''
    }
    getSelectedQualification([])
    userOptions.value = []
    testParamOptions.value = []
  }

  isSystemTestTask.value = val
}

function onSelectTask() {
  if (!eqIds.value.length) {
    message.warn('请先选择设备')
    return
  }

  AnyDialogHelper.showSelector<TestTaskListItemDTO>(TaskSelector, {
    payload: {
      type: 1,
      queryScope: 'user',
      dataType: 1,
    },
  }).then(([row]: TestTaskListItemDTO[]) => {
    setTestTask(row)
  })
}

async function setTestTask(row: TestTaskListItemDTO, authErrorCb?: () => void) {
  loading.value = true
  const { data } = await getTestTaskDetail(row.id).finally(() => {
    loading.value = false
  })

  testTaskDetail.value = data

  const qualificationTypeId = data.consignInfo.qualificationTypeId

  if (!await checkEqAuthUser(eqIds.value, testPersons.value, '检测任务')) {
    if (authErrorCb) {
      authErrorCb()
    }
    return
  }

  setIsSystemTestTask(true)

  formState.value.testTaskId = row.id
  formState.value.testTaskCode = row.testTaskCode
  formState.value.testObjectCode = row.testObjectCode
  formState.value.projectName = row.projectNames
  formState.value.testTaskParamName = ''
  formState.value.testTaskParamId = undefined

  if (EQUIPMENT_USE_RECORD_USER.value) {
    formState.value.userId = undefined
    formState.value.userName = ''
  }

  getSelectedQualification(qualificationTypeId ? [qualificationTypeId] : [])

  loadTestParamOptions()
}

// 根据资质id数组，转换为文本或id字符串
function getSelectedQualification(data: string[]) {
  if (!Array.isArray(data) && !data.length) {
    qualificationType.value = []
    return
  }

  const rows = allQualificationData.value.filter((i: any) => data.includes(i.id)).map((i: any) => ({
    value: i.id,
    label: i.name,
  }))

  qualificationOptions.value = qualificationOptions.value.filter((i: any) => !i.isDelete)

  rows.forEach((i: any) => {
    if (!qualificationOptions.value.find((j: any) => j.value === i.value)) {
      qualificationOptions.value.push({
        ...i,
        isDelete: true,
      })
    }
  })

  qualificationType.value = Array.from(new Set(data))
}

async function checkEqAuthUser(equipmentIds: string[], testPerson: TestTaskPerson[], title: string) {
  if (!EQUIPMENT_USE_RECORD_USER.value) {
    return true
  }

  loading.value = true
  const res = await getEqAuthInfo(equipmentIds.join(',')).finally(() => {
    loading.value = false
  })

  const data = res.data

  if (!data.auth) {
    userOptions.value = testPerson.map(i => ({
      label: i.name,
      value: i.userId,
    }))
    return true
  }

  const authTestUser = testPerson.filter((i) => {
    return (data.authUserList || []).includes(i.userId)
  })

  if (authTestUser.length === 0) {
    Modal.error({
      title: `添加${title}失败`,
      content: `当前任务检测人员没有设备操作授权，请联系部门管理员完成授权后再尝试！`,
    })
    return false
  }

  userOptions.value = authTestUser.map(i => ({
    label: i.name,
    value: i.userId,
  }))

  return true
}

// 关闭弹窗
function cancel() {
  open.value = false
}

// 保存前检查检测任务和检测参数变更
function checkTestTaskChange() {
  return new Promise((resolve) => {
    if (record.value && (formState.value.testTaskId !== formState.value.oTestTaskId || formState.value.testTaskParamId !== formState.value.oTestTaskParamId)) {
      Modal.confirm({
        title: '您正在编辑设备使用记录！',
        content: `试验任务或检测参数发生变化，将同步删除关联任务中对应参数的设备使用数据，您确定吗？`,
        onOk: () => {
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        },
      })
    }
    else {
      resolve(true)
    }
  })
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    if (!await checkTestTaskChange()) {
      return
    }

    submitLoading.value = true

    if (!record.value) {
      await addEqUseRecord({
        equipmentIds: eqIds.value,
        ...formState.value,
        qualificationType: qualificationType.value.join(','),
      }).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await updateEqUseRecord({
        ids: [record.value.id],
        ...formState.value,
        qualificationType: qualificationType.value.join(','),
      }).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    props.onConfirm(null)
    cancel()
  })
}
</script>
