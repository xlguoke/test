<template>
  <van-field
    v-if="!hideFields.includes('laboratoryIotEqType')"
    required="auto"
    name="laboratoryIotEqType"
    label="预约类型"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
  >
    <template #input>
      <van-radio-group v-model="laboratoryIotEqType" direction="horizontal" shape="dot">
        <van-radio
          v-for="item in LaboratoryIotEqTypeDict"
          :key="(item.key as string)"
          :name="item.key"
        >
          {{ item.label }}
        </van-radio>
      </van-radio-group>
    </template>
  </van-field>
  <van-field
    v-if="!hideFields.includes('taskId')"
    v-model="taskName"
    required="auto"
    is-link
    readonly
    name="picker"
    label="试验任务"
    placeholder="请选择"
    @click="showPickerTask = true"
  />
  <van-field
    v-if="!hideFields.includes('laboratoryId')"
    v-model="laboratory"
    required="auto"
    is-link
    readonly
    name="laboratory"
    label="试验室"
    placeholder="请选择"
    :disabled="isNeedAuth === IsNeedAuth.NO"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="isNeedAuth === IsNeedAuth.YES && (showPickerLaboratory = true)"
  />
  <van-field
    v-if="laboratoryIotEqType === LaboratoryIotEqType.调养箱"
    v-model="laboratoryIotEq"
    required="auto"
    is-link
    readonly
    name="laboratoryIotEqId"
    label="调养箱"
    placeholder="请选择"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="showPickerIotEq = true"
  />
  <van-field
    v-if="selectedLaboratory.length && taskId && laboratoryIotEqType === LaboratoryIotEqType.功能室"
    autosize
    label="试验参数"
    input-align="right"
  >
    <template #input>
      <van-checkbox-group
        v-if="testParamOptions.length > 0"
        v-model="testParams"
        direction="horizontal"
        @change="clacDefaultHumiture"
      >
        <van-checkbox
          v-for="item in testParamOptions"
          :key="item.value"
          :name="item.value"
          shape="square"
          style="margin: 4px;"
        >
          {{ item.label }}
        </van-checkbox>
      </van-checkbox-group>
      <span v-else class="text-#5B7489">无符合条件的试验参数</span>
    </template>
  </van-field>
  <van-field
    v-model="resUser"
    required="auto"
    is-link
    readonly
    name="picker"
    label="预约人员"
    placeholder="请选择"
    :disabled="isNeedAuth === IsNeedAuth.NO"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="isNeedAuth === IsNeedAuth.YES && (showPickerPerson = true)"
  />
  <van-field
    v-model="startDateStr"
    required="auto"
    is-link
    readonly
    name="startDateStr"
    label="开始时间"
    placeholder="请选择"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="showPickerStartDate = true"
  />
  <van-field
    v-model="endDateStr"
    required="auto"
    is-link
    readonly
    name="endDateStr"
    label="结束时间"
    placeholder="请选择"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="showPickerEndDate = true"
  />
  <van-field
    v-if="laboratoryIotEqType === LaboratoryIotEqType.功能室"
    required
    label="目标温度"
  >
    <template #input>
      <van-field
        v-model="tStart"
        required="auto"
        class="p0! after:hidden"
        type="number"
        name="tStart"
        placeholder="请输入"
        :rules="[
          { required: true, message: '请输入', trigger: 'onChange' },
          { validator: validatorTem, trigger: 'onChange' },
        ]"
      />
      <div px12>
        -
      </div>
      <van-field
        v-model="tEnd"
        required="auto"
        class="p0!"
        type="number"
        name="tEnd"
        placeholder="请输入"
        :rules="[
          { required: true, message: '请输入', trigger: 'onChange' },
          { validator: validatorTem, trigger: 'onChange' },
        ]"
      />
    </template>
  </van-field>
  <van-field
    v-if="laboratoryIotEqType === LaboratoryIotEqType.功能室"
    required
    label="目标湿度"
  >
    <template #input>
      <van-field
        v-model="rhStart"
        required="auto"
        class="p0! after:hidden"
        type="number"
        name="rhStart"
        placeholder="请输入"
        :rules="[
          { required: true, message: '请输入', trigger: 'onChange' },
          { validator: validatorHum, trigger: 'onChange' },
        ]"
      />
      <div px12>
        -
      </div>
      <van-field
        v-model="rhEnd"
        required="auto"
        class="p0!"
        type="number"
        name="rhEnd"
        placeholder="请输入"
        :rules="[
          { required: true, message: '请输入', trigger: 'onChange' },
          { validator: validatorHum, trigger: 'onChange' },
        ]"
      />
    </template>
  </van-field>
  <van-field
    required="auto"
    name="customType"
    label="结束时处理"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
  >
    <template #input>
      <van-radio-group v-model="customType" direction="horizontal" shape="dot">
        <van-radio
          v-for="item in CustomTypeDict"
          :key="(item.key as string)"
          :name="item.key"
        >
          {{ item.label }}
        </van-radio>
      </van-radio-group>
    </template>
  </van-field>

  <!-- 设置对象选择器 -->
  <TestTaskSelector
    v-model:show="showPickerTask"
    :check-back-ids="checkBackIds"
    :lab-id="query.laboratoryId"
    @confirm="onConfirmField1"
  ></TestTaskSelector>
  <!-- 试验室选择器 -->
  <van-popup v-model:show="showPickerLaboratory" position="bottom">
    <van-picker
      v-model="selectedLaboratory"
      :columns="columns2"
      @confirm="onConfirmField2"
      @cancel="showPickerLaboratory = false"
    />
  </van-popup>
  <!-- 调养箱选择器 -->
  <van-popup v-model:show="showPickerIotEq" position="bottom">
    <van-picker
      v-model="selectLaboratoryIotEq"
      :columns="columns3"
      @confirm="onConfirmField3"
      @cancel="showPickerIotEq = false"
    />
  </van-popup>
  <!-- 人员选择器 -->
  <PersonSelector
    v-if="isNeedAuth === IsNeedAuth.YES"
    v-model:show="showPickerPerson"
    @confirm="handleChoosedPerson"
  ></PersonSelector>
  <!-- 开始时间选择器 -->
  <van-popup v-model:show="showPickerStartDate" position="bottom">
    <van-picker-group
      next-step-text="下一步"
      title="控制时间"
      :tabs="['选择日期', '选择时间']"
      @confirm="onConfirm4"
      @cancel="showPickerStartDate = false"
    >
      <van-date-picker
        v-model="startDate"
      />
      <van-time-picker
        v-model="startTime"
        :columns-type="['hour', 'minute', 'second']"
      />
    </van-picker-group>
  </van-popup>
  <!-- 结束时间选择器 -->
  <van-popup v-model:show="showPickerEndDate" position="bottom">
    <van-picker-group
      next-step-text="下一步"
      title="控制时间"
      :tabs="['选择日期', '选择时间']"
      @confirm="onConfirm5"
      @cancel="showPickerEndDate = false"
    >
      <van-date-picker
        v-model="endDate"
      />
      <van-time-picker
        v-model="endTime"
        :columns-type="['hour', 'minute', 'second']"
      />
    </van-picker-group>
  </van-popup>
</template>

<script lang="ts" setup>
import { getLaboratoryWithoutIOT, getPersonByTask } from '@/api'
import { getLocalUserInfo } from '@/utils/getLocalUserInfo'
import dayjs from 'dayjs'

import { CustomType, CustomTypeDict, getHumitureTestParamConfig, LaboratoryIotEqType, LaboratoryIotEqTypeDict } from '.'
import type { IPreTask } from '../preTask'
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { closeToast, showFailToast, showLoadingToast } from 'vant'
import { getRoomDivece } from '../device'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'

const props = defineProps<{
  initData?: any
  hideFields?: string[]
}>()

const { isNeedAuth } = usePermissionStore()

const query = props.initData || {} as IPreTask

const hideFields = computed(() => props.hideFields || [])

// 设置对象选择器
const taskName = ref(query.testSampleDisplayName)
const taskId = ref(query.testTaskId)
const checkBackIds = computed(() => {
  return [taskId.value]
})
const showPickerTask = ref(false)

async function onConfirmField1(val) {
  taskName.value = val.testSampleDisplayName
  taskId.value = val.id
  showPickerTask.value = false
  getTestParamConfig()
  if (isNeedAuth === IsNeedAuth.NO) {
    setTestPerson(taskId.value)
  }
}

function getTemHumVal(val, newVal, type) {
  if (newVal !== null && newVal !== undefined) {
    if (val === null) {
      return newVal
    }

    if (type === 'min') {
      if (newVal > val) {
        return newVal
      }
    }

    if (type === 'max') {
      if (newVal < val) {
        return newVal
      }
    }
  }
  return val
}

// 试验室选择器
const laboratory = ref('')
const selectedLaboratory = ref([query.laboratoryId])
const showPickerLaboratory = ref(false)
const columns2 = ref([])

const laboratoryIotEq = ref('')
const selectLaboratoryIotEq = ref([query.laboratoryIotEqId])
const showPickerIotEq = ref(false)
const columns3 = ref([])

const laboratoryList = ref([] as ILaboratory[])
const currentLaboratory = ref({} as ILaboratory)
async function getLaboratoryList() {
  showLoadingToast({ duration: 0, forbidClick: true, message: '加载中...' })
  const { data } = await getLaboratoryWithoutIOT({ page: 1, size: 999, isIotLab: '1' }).finally(() => {
    closeToast()
  })
  laboratoryList.value = data.rows
  columns2.value = data?.rows.map((item) => {
    return {
      text: item.name,
      value: item.id,
    }
  })
  currentLaboratory.value = data?.rows?.find(item => item.id === query.laboratoryId) || {}
  laboratory.value = data?.rows?.find(item => item.id === query.laboratoryId)?.name || ''

  if (query.id) {
    getIotEq(query.laboratoryId, true)
    getTestParamConfig(true)
  }
  else {
    getTestParamConfig()
  }
}

function onConfirmField2({ selectedOptions }) {
  laboratory.value = selectedOptions[0]?.text
  currentLaboratory.value = laboratoryList.value.find(item => item.id === selectedOptions[0]?.value)
  showPickerLaboratory.value = false
  if (currentLaboratory.value.maxConTem === null
    || currentLaboratory.value.minConTem === null
    || currentLaboratory.value.maxConHum === null
    || currentLaboratory.value.minConHum === null
  ) {
    showDialog({
      message: '未正确配置功能室可控范围，请检查功能室配置',
    })
  }
  selectLaboratoryIotEq.value = []
  laboratoryIotEq.value = ''
  getIotEq(selectedOptions[0]?.value)
  getTestParamConfig()
  setHumitureByLaboratoryId(selectedOptions[0]?.value)
}

function onConfirmField3({ selectedOptions }) {
  laboratoryIotEq.value = selectedOptions[0]?.text
  showPickerIotEq.value = false
}

async function getIotEq(id: string, isInit = false) {
  const target = laboratoryList.value.find((item) => {
    return item.id === id
  }) as ILaboratory

  const res = await getRoomDivece(target.iotEqId)
  columns3.value = res.data.filter(i => i.type === '调养箱').map(i => ({
    text: i.toName,
    value: i.to.id,
  }))

  if (isInit === true && !laboratoryIotEq.value && query.laboratoryIotEqId) {
    const item = columns3.value.find(i => i.value === query.laboratoryIotEqId)
    if (item) {
      laboratoryIotEq.value = item.text
    }
  }
}

function validatorTem(val) {
  if (currentLaboratory.value.maxConTem === null
    || currentLaboratory.value.minConTem === null) {
    return '未配置可控范围'
  }
  if (val > currentLaboratory.value.maxConTem) {
    return `超过最大值${currentLaboratory.value.maxConTem}`
  }
  if (val < currentLaboratory.value.minConTem) {
    return `低于最小值${currentLaboratory.value.minConTem}`
  }
  return true
}

function validatorHum(val) {
  if (currentLaboratory.value.maxConHum === null
    || currentLaboratory.value.minConHum === null) {
    return '未配置可控范围'
  }
  if (val > currentLaboratory.value.maxConHum) {
    return `超过最大值${currentLaboratory.value.maxConHum}`
  }
  if (val < currentLaboratory.value.minConHum) {
    return `低于最小值${currentLaboratory.value.minConHum}`
  }
  return true
}

// 人员选择器
const resUser = ref(query.resUserName || getLocalUserInfo()?.realName)
const resUserId = ref(query.resUserId || getLocalUserInfo()?.userId)
const showPickerPerson = ref(false)
function handleChoosedPerson(val) {
  resUser.value = val?.[0]?.name
  resUserId.value = val?.[0]?.id
  showPickerPerson.value = false
}

async function setTestPerson(taskId: string) {
  const { data } = await getPersonByTask(taskId)
  if (data?.length) {
    resUser.value = data?.[0]?.name
    resUserId.value = data?.[0]?.id
  }
}

// 开始时间选择器
const startDate = ref(dayjs().format('YYYY-MM-DD').split('-'))
const startTime = ref(dayjs().format('HH:mm:00').split(':'))
if (query.startDate) {
  startDate.value = dayjs(Number(query.startDate)).format('YYYY-MM-DD').split('-')
  startTime.value = dayjs(Number(query.startDate)).format('HH:mm:ss').split(':')
}

const startDateStr = computed(() => {
  return `${startDate.value.join('-')} ${startTime.value.join(':')}`
})
const showPickerStartDate = ref(false)
function onConfirm4() {
  showPickerStartDate.value = false
}

// 结束时间选择器
const endDate = ref(dayjs().format('YYYY-MM-DD').split('-'))
const endTime = ref(dayjs().format('HH:mm:00').split(':'))
if (query.endDate) {
  endDate.value = dayjs(Number(query.endDate)).format('YYYY-MM-DD').split('-')
  endTime.value = dayjs(Number(query.endDate)).format('HH:mm:ss').split(':')
}

const endDateStr = computed(() => {
  return `${endDate.value.join('-')} ${endTime.value.join(':')}`
})
const showPickerEndDate = ref(false)
function onConfirm5() {
  showPickerEndDate.value = false
}

// 目标温度
const tStart = ref(query.tem || '')
const tEnd = ref(query.maxTem || '')

// 目标湿度
const rhStart = ref(query.hum || '')
const rhEnd = ref(query.maxHum || '')

/** 结束时处理 */
const customType = ref(query.customType || CustomType.不处理)

// 预约类型
const laboratoryIotEqType = ref(query.laboratoryIotEqType || LaboratoryIotEqType.功能室)

// 试验参数
const testParams = ref(query.testParams ? query.testParams.split(',') : [])
const testParamOptions = ref([])
const paramHumConfig = ref([])

async function getTestParamConfig(isEditInit = false) {
  if (laboratoryIotEqType.value === LaboratoryIotEqType.功能室 && selectedLaboratory.value[0] && taskId.value) {
    const res = await getHumitureTestParamConfig(selectedLaboratory.value[0], taskId.value)

    testParamOptions.value = res.data.paramList.map(i => ({
      label: i.displayName,
      value: i.id,
    }))
    paramHumConfig.value = res.data.paramHumConfig

    if (isEditInit) {
      return
    }

    testParams.value = []

    clacDefaultHumiture()
  }
}

// 根据选择参数计算温湿度默认值
function clacDefaultHumiture() {
  if (laboratoryIotEqType.value !== LaboratoryIotEqType.功能室) {
    return
  }

  let minTem = isDefined(currentLaboratory.value.minTemperature) ? currentLaboratory.value.minTemperature : null
  let maxTem = isDefined(currentLaboratory.value.maxTemperature) ? currentLaboratory.value.maxTemperature : null
  let minHum = isDefined(currentLaboratory.value.minHumidity) ? currentLaboratory.value.minHumidity : null
  let maxHum = isDefined(currentLaboratory.value.maxHumidity) ? currentLaboratory.value.maxHumidity : null

  if (paramHumConfig.value.length) {
    paramHumConfig.value.forEach((item) => {
      if (testParams.value.includes(item.testParamId)) {
        minTem = getTemHumVal(minTem, item.houseTemMin, 'min')
        maxTem = getTemHumVal(maxTem, item.houseTemMax, 'max')

        minHum = getTemHumVal(minHum, item.houseHumMin, 'min')
        maxHum = getTemHumVal(maxHum, item.houseHumMax, 'max')
      }
    })
  }

  tStart.value = minTem
  tEnd.value = maxTem
  rhStart.value = minHum
  rhEnd.value = maxHum
}
function setHumitureByLaboratoryId(id: string) {
  const target = laboratoryList.value.find((item) => {
    return item.id === id
  }) as ILaboratory
  tStart.value = target.minTemperature
  tEnd.value = target.maxTemperature
  rhStart.value = target.minHumidity
  rhEnd.value = target.maxHumidity
}
async function getFormData() {
  return new Promise((resolve, _reject) => {
    const form = {
      laboratoryIotEqType: laboratoryIotEqType.value,
      laboratoryId: selectedLaboratory.value[0],
      laboratoryIotEqId: selectLaboratoryIotEq.value[0],
      boxName: laboratoryIotEq.value,
      customType: customType.value,
      startDate: startDateStr.value,
      endDate: endDateStr.value,
      resUserId: resUserId.value,
      taskId: taskId.value,
      tem: tStart.value,
      maxTem: tEnd.value,
      hum: rhStart.value,
      maxHum: rhEnd.value,
      testParams: testParams.value.join(','),
    }
    if (+new Date(endDateStr.value) <= +new Date(startDateStr.value)) {
      showFailToast('结束时间必须大于开始时间！')
      return
    }
    if (tStart.value > tEnd.value) {
      showFailToast('目标温度，最小温度不能大于最大温度！')
      return
    }
    if (rhStart.value > rhEnd.value) {
      showFailToast('目标湿度，最小湿度不能大于最大湿度！')
      return
    }

    if (form.laboratoryIotEqType === LaboratoryIotEqType.功能室) {
      form.laboratoryIotEqId = undefined
    }
    else {
      form.testParams = ''
    }

    resolve({ ...form })
  })
}

onMounted(() => {
  getLaboratoryList()
})

defineExpose({
  getFormData,
  currentLaboratory,
  getTestParamConfig,
  getLaboratoryList,
  startDate,
  startTime,
  endDate,
  endTime,
})
</script>
