<template>
  <van-field
    required="auto"
    name="taskType"
    label="送样类型"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
  >
    <template #input>
      <van-radio-group v-model="taskType" direction="horizontal" shape="dot">
        <van-radio
          v-for="item in SampleSendTypeDict"
          :key="(item.key as string)"
          :name="item.key"
        >
          {{ item.label }}
        </van-radio>
      </van-radio-group>
    </template>
  </van-field>
  <van-field
    :model-value="objectName"
    name="objectName"
    readonly
    autosize
    disabled
    label="样品名称"
    placeholder="请选择"
  />
  <van-field
    :model-value="objectCode === 'null' ? '-' : objectCode"
    name="objectCode"
    readonly
    autosize
    disabled
    label="样品编号"
    placeholder="请选择"
  />
  <van-field
    v-model="laboratory"
    required="auto"
    is-link
    readonly
    name="laboratory"
    label="功能室"
    placeholder="请选择"
    :disabled="isNeedAuth === IsNeedAuth.NO"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="isNeedAuth === IsNeedAuth.YES && (showPickerLaboratory = true)"
  />
  <van-field
    v-if="taskType === SampleSendType.Appointment"
    v-model="requestDeliveryTime"
    required="auto"
    is-link
    readonly
    name="requestDeliveryTime"
    label="要求送达时间"
    placeholder="请选择"
    :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
    @click="showPickerStartDate = true"
  />
  <van-field
    required="auto"
    name="taskType"
    label="功能室温湿度预约"
  >
    <template #input>
      <van-switch
        v-model="appointmentTemperatureAndHumidity"
        size="24"
        @change="emit('preChange', appointmentTemperatureAndHumidity)"
      ></van-switch>
      <!-- <van-radio-group
        v-model="appointmentTemperatureAndHumidity"
        direction="horizontal"
        shape="dot"
        @change="emit('preChange', appointmentTemperatureAndHumidity)"
      >
        <van-radio :name="true">
          是
        </van-radio>
        <van-radio :name="false">
          否
        </van-radio>
      </van-radio-group> -->
    </template>
  </van-field>

  <!-- 试验室选择器 -->
  <van-popup v-model:show="showPickerLaboratory" position="bottom">
    <van-picker
      v-model="selectedLaboratory"
      :columns="columns2"
      @confirm="onConfirmField2"
      @cancel="showPickerLaboratory = false"
    />
  </van-popup>

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
</template>

<script lang="ts" setup>
import { getLaboratoryWithoutIOT } from '@/api'
import dayjs from 'dayjs'

import { SampleSendType, SampleSendTypeDict } from './index'
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { closeToast, showLoadingToast } from 'vant'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'

const props = defineProps<{
  initData?: any
}>()

const emit = defineEmits<{
  (e: 'preChange', data: boolean): void
  (e: 'labChange', data: void): void
}>()

const query = props.initData || {} as any

const taskType = ref(SampleSendType.Appointment)
const { isNeedAuth } = usePermissionStore()

// 试验室选择器
const laboratory = ref('')
const selectedLaboratory = ref([props.initData.labId])
const showPickerLaboratory = ref(false)
const columns2 = ref([])

const laboratoryList = ref([] as ILaboratory[])
const currentLaboratory = ref({} as ILaboratory)

watch(() => currentLaboratory.value, () => {
  emit('labChange')
})

async function getLaboratoryList() {
  showLoadingToast({ duration: 0, forbidClick: true, message: '加载中...' })
  const { data } = await getLaboratoryWithoutIOT({ page: 1, size: 999, noAuth: 1 }).finally(() => {
    closeToast()
  })
  laboratoryList.value = data.rows
  columns2.value = data?.rows.map((item) => {
    return {
      text: item.name,
      value: item.id,
    }
  })
  currentLaboratory.value = data?.rows?.find(item => item.id === query.labId) || {}
  laboratory.value = currentLaboratory.value?.name || ''
}

function onConfirmField2({ selectedOptions }) {
  laboratory.value = selectedOptions[0]?.text
  currentLaboratory.value = laboratoryList.value.find(item => item.id === selectedOptions[0]?.value)
  showPickerLaboratory.value = false
}

// 开始时间选择器
const startDate = ref(dayjs(new Date(new Date().setHours(24 + 8, 0, 0, 0))).format('YYYY-MM-DD').split('-'))
const startTime = ref(dayjs(new Date(new Date().setHours(24 + 8, 0, 0, 0))).format('HH:mm:00').split(':'))
if (query.startDate) {
  startDate.value = dayjs(Number(query.startDate)).format('YYYY-MM-DD').split('-')
  startTime.value = dayjs(Number(query.startDate)).format('HH:mm:ss').split(':')
}

const requestDeliveryTime = computed(() => {
  return `${startDate.value.join('-')} ${startTime.value.join(':')}`
})
const showPickerStartDate = ref(false)
function onConfirm4() {
  showPickerStartDate.value = false
}

const objectName = ref(props.initData.objectName || '')
const objectCode = ref(props.initData.objectCode || '')

const appointmentTemperatureAndHumidity = ref(false)

async function getFormData() {
  return new Promise((resolve, _reject) => {
    const form = {
      taskId: props.initData.taskId,
      taskCode: props.initData.taskCode,
      objectName: objectName.value,
      objectCode: objectCode.value === 'null' ? '' : objectCode.value,
      taskType: taskType.value,
      operatorId: props.initData.operatorId,
      labId: currentLaboratory.value.id,
      labName: laboratory.value,
      requestDeliveryTime: `${startDate.value.join('-')} ${startTime.value.join(':')}`,
      appointmentTemperatureAndHumidity: appointmentTemperatureAndHumidity.value,
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
  startDate,
  startTime,
  taskType,
})
</script>
