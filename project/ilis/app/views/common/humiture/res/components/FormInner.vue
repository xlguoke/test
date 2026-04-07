<template>
  <a-form
    ref="formRef"
    :rules="rules"
    :model="formState"
    class="pt-4 max-h-[80vh] overflow-auto"
    :label-col="{ span: 7 }"
  >
    <a-form-item v-if="!hideFields.includes('taskId')" label="任务" name="taskId">
      <a-flex justify="space-between" align="center">
        <div>
          <template v-if="formState.taskId">
            {{ selectedTestTask.testSampleDisplayName }}({{ selectedTestTask.testTaskCode }})
          </template>
        </div>
        <a-button v-if="!isDetail" @click="setSelectTestTaskVisible(true)">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
    <a-form-item v-if="!hideFields.includes('laboratoryIotEqType')" label="预约类型" name="laboratoryIotEqType">
      <a-radio-group v-model:value="formState.laboratoryIotEqType" :disabled="isDetail">
        <a-radio
          v-for="item in LaboratoryIotEqTypeDict"
          :key="(item.key as string)"
          :value="item.key"
          :disabled="item.label === '调养箱' && !HUMITURE_BOOK_CON"
        >
          {{ item.label }}
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="!hideFields.includes('laboratoryId')" label="功能室" name="laboratoryId" :rules="[{ required: true, message: '请选择功能室！' }]">
      <a-select
        v-model:value="formState.laboratoryId"
        :options="laboratoryOptions"
        placeholder="请选择功能室"
        :disabled="isDetail"
        @change="() => {
          formState.laboratoryIotEqId = undefined;
          onSelectLab();
          getTestParamConfig();
        }"
      />
    </a-form-item>
    <a-form-item v-if="formState.laboratoryIotEqType === LaboratoryIotEqType.调养箱" label="调养箱" name="laboratoryIotEqId" :rules="[{ required: true, message: '请选择调养箱！' }]">
      <a-select
        v-model:value="formState.laboratoryIotEqId"
        :options="iotEqList"
        placeholder="请选择调养箱"
        :disabled="isDetail"
      />
    </a-form-item>
    <a-form-item v-if="formState.laboratoryId && formState.taskId && formState.laboratoryIotEqType === LaboratoryIotEqType.功能室" label="试验参数" name="testParams">
      <a-checkbox-group v-if="testParamOptions.length > 0" v-model:value="formState.testParams" :disabled="isDetail" :options="testParamOptions" @change="clacDefaultHumiture" />
      <span v-else class="text-gray-500">无符合条件的试验参数</span>
    </a-form-item>
    <a-form-item label="开始时间" name="startDate" :rules="[{ required: true, message: '请选择开始时间！' }]">
      <a-date-picker
        v-model:value="formState.startDate"
        class="w-full"
        show-time
        value-format="YYYY-MM-DD HH:mm:ss"
        :disabled="isDetail"
        :disabled-date="disabledDate"
        placeholder="请选择开始时间"
      />
    </a-form-item>
    <a-form-item label="结束时间" name="endDate" :rules="[{ required: true, message: '请选择结束时间！' }]">
      <a-date-picker
        v-model:value="formState.endDate"
        class="w-full"
        show-time
        value-format="YYYY-MM-DD HH:mm:ss"
        :disabled="isDetail"
        :disabled-date="disabledDate"
        placeholder="请选择结束时间"
      />
    </a-form-item>
    <a-form-item v-if="formState.laboratoryIotEqType === LaboratoryIotEqType.功能室" label="目标温度（℃）" name="tem">
      <div class="w-full flex-1 flex items-center gap-1">
        <a-input-number
          v-model:value="formState.tem"
          class="flex-1"
          placeholder="最小温度"
          :min="selectedLab.minConTem"
          :max="selectedLab.maxConTem"
          :disabled="isDetail"
        />
        ~
        <a-input-number
          v-model:value="formState.maxTem"
          class="flex-1"
          placeholder="最大温度"
          :min="selectedLab.minConTem"
          :max="selectedLab.maxConTem"
          :disabled="isDetail"
        />
      </div>
    </a-form-item>
    <a-form-item v-if="formState.laboratoryIotEqType === LaboratoryIotEqType.功能室" label="目标湿度（%RH）" name="hum">
      <div class="w-full flex-1 flex items-center gap-1">
        <a-input-number
          v-model:value="formState.hum"
          class="flex-1"
          placeholder="最小湿度"
          :min="selectedLab.minConHum"
          :max="selectedLab.maxConHum"
          :disabled="isDetail"
        />
        ~
        <a-input-number
          v-model:value="formState.maxHum"
          class="flex-1"
          placeholder="最大湿度"
          :min="selectedLab.minConHum"
          :max="selectedLab.maxConHum"
          :disabled="isDetail"
        />
      </div>
    </a-form-item>
    <a-form-item label="结束时处理" name="customType" :rules="[{ required: true, message: '请选择结束时处理！' }]">
      <a-radio-group v-model:value="formState.customType" :disabled="isDetail">
        <a-radio v-for="item in CustomTypeDict" :key="item.key as string" :value="item.key">
          {{ item.label }}
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="预约人员" name="resUserId" :rules="[{ required: true, message: '请选择选择预约人员！' }]">
      <a-flex justify="space-between" align="center">
        <div>{{ selectedPerson.name }}</div>
        <a-button v-if="!isDetail" @click="setPersonSelectorVisible(true)">
          选择
        </a-button>
      </a-flex>
    </a-form-item>
  </a-form>

  <!-- 选择人员 -->
  <PersonSelector v-model:show="personSelectorVisible" :checked-ids="[formState.resUserId as string]" @confirm="onSelectPerson" />

  <!-- 选择任务 -->
  <SelectTestTask v-model:open="selectTestTaskVisible" @on-select="onSelectTestTask" />
</template>

<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import type { PropType } from 'vue'
import type { LaboratoryDataEntity } from '~/api/laboratory'
import type { IOption } from '~/interface/IOption'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import type { ParamHumConfigDTO } from '~/views/common/humiture/res/api/getTestParamConfig.ts'
import type { TestTaskDataItem } from '~/views/common/humiture/res/api/getTestTask.ts'
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import PersonSelector from '~/components/PersonSelector.vue'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { CustomTypeDict } from '~/views/common/humiture/res'
import { CreateHumitureResEntity } from '~/views/common/humiture/res/api/createHumitureRes.ts'
import { getHumitureTestParamConfig } from '~/views/common/humiture/res/api/getTestParamConfig.ts'
import { LaboratoryIotEqType, LaboratoryIotEqTypeDict } from '~/views/common/humiture/timer'
import { getIots } from '../../displayDetails/api'
import SelectTestTask from './SelectTestTask.vue'

const props = defineProps({
  defaultLabId: {
    type: String,
    default: null,
  },
  dataSource: {
    type: Object as PropType<CreateHumitureResEntity | null>,
    default: () => (new CreateHumitureResEntity()),
  },
  hideFields: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1, isAuth: 2 }) // 新增功能室权限控制

const [personSelectorVisible, setPersonSelectorVisible] = useStateHooks(false)

const [selectTestTaskVisible, setSelectTestTaskVisible] = useStateHooks(false)

const selectedPerson = ref({} as any)

const selectedTestTask = ref({} as any)

const localUserInfo = getLocalUserInfo()

const isDetail = computed(() => !!(props.dataSource && !props.dataSource.id))

const formRef = ref()

const selectedLab = ref({} as LaboratoryDataEntity)

const iotEqList = ref<IOption[]>([])

const testParamOptions = ref<IOption[]>([])

const paramHumConfig = ref<ParamHumConfigDTO[]>([])

const formState = ref(new CreateHumitureResEntity())

/** 控制参数：是否支持控制调养箱 */
const HUMITURE_BOOK_CON = ref(false)

const rules: Record<string, Rule[]> = {
  tem: [{ required: true, validator: () => {
    if ((formState.value.tem === undefined || formState.value.tem === null) || (formState.value.maxTem === undefined || formState.value.maxTem === null)) {
      return Promise.reject(new Error('请输入目标温度！'))
    }
    return Promise.resolve()
  } }],
  hum: [{ required: true, validator: () => {
    if ((formState.value.hum === undefined || formState.value.hum === null) || (formState.value.maxHum === undefined || formState.value.maxHum === null)) {
      return Promise.reject(new Error('请输入目标湿度！'))
    }
    return Promise.resolve()
  } }],
}

watch(() => laboratoryOptions.value, () => {
  onOpen()
})

async function getSystemParam() {
  HUMITURE_BOOK_CON.value = await getBusinessParam('HUMITURE_BOOK_CON')
}
getSystemParam()

function onSelectLab() {
  const item = laboratoryOptions.value.find(i => i.value === formState.value.laboratoryId)
  selectedLab.value = item || {} as LaboratoryDataEntity

  if (item) {
    getMaintenanceBox(item.iotEqId)
  }
}

async function getTestParamConfig(isEditInit = false) {
  if (formState.value.laboratoryId) {
    clacDefaultHumiture()
  }
  if (formState.value.laboratoryId && formState.value.taskId) {
    const res = await getHumitureTestParamConfig(formState.value.laboratoryId, formState.value.taskId)
    testParamOptions.value = res.data.paramList.map(i => ({
      label: i.displayName,
      value: i.id,
    }))
    paramHumConfig.value = res.data.paramHumConfig

    if (isEditInit) {
      return
    }

    formState.value.testParams = []
  }
}

// 根据选择参数计算温湿度默认值
function clacDefaultHumiture() {
  if (formState.value.laboratoryIotEqType !== LaboratoryIotEqType.功能室) {
    return
  }

  let minTem = isDefined(selectedLab.value.minTemperature) ? selectedLab.value.minTemperature : undefined
  let maxTem = isDefined(selectedLab.value.maxTemperature) ? selectedLab.value.maxTemperature : undefined
  let minHum = isDefined(selectedLab.value.minHumidity) ? selectedLab.value.minHumidity : undefined
  let maxHum = isDefined(selectedLab.value.maxHumidity) ? selectedLab.value.maxHumidity : undefined

  if (paramHumConfig.value.length) {
    paramHumConfig.value.forEach((item) => {
      if (formState.value.testParams.includes(item.testParamId)) {
        minTem = getTemHumVal(minTem, item.houseTemMin, 'min')
        maxTem = getTemHumVal(maxTem, item.houseTemMax, 'max')

        minHum = getTemHumVal(minHum, item.houseHumMin, 'min')
        maxHum = getTemHumVal(maxHum, item.houseHumMax, 'max')
      }
    })
  }

  formState.value.tem = minTem
  formState.value.maxTem = maxTem
  formState.value.hum = minHum
  formState.value.maxHum = maxHum

  if (formRef.value) {
    formRef.value.validate(['tem', 'maxTem', 'hum', 'maxHum'])
  }
}

async function getMaintenanceBox(id: string) {
  const res = await getIots(id)

  iotEqList.value = res.data.filter(i => i.type === '调养箱').map(i => ({
    label: i.toName,
    value: i.to.id,
  }))
}

function onOpen() {
  const defaultData = props.dataSource

  if (defaultData) {
    formState.value = defaultData
    formState.value.startDate = dayjs(formState.value.startDate).format('YYYY-MM-DD HH:mm:ss')
    formState.value.endDate = dayjs(formState.value.endDate).format('YYYY-MM-DD HH:mm:ss')
    formState.value.taskId = defaultData.testTaskId
    formState.value.testParams = (defaultData.paramList || []).map(i => i.id)

    selectedTestTask.value = {
      id: defaultData.taskId,
      testSampleDisplayName: defaultData.testSampleDisplayName,
      testTaskCode: defaultData.testTaskCode,
    }

    selectedPerson.value = {
      id: defaultData.resUserId,
      name: defaultData.resUserName,
    }

    onSelectLab()
    // getTestParamConfig(true)
  }
  else {
    selectedPerson.value = {
      id: localUserInfo?.userId,
      name: localUserInfo?.realName,
    }
    formState.value.resUserId = selectedPerson.value.id

    if (props.defaultLabId) {
      formState.value.laboratoryId = props?.defaultLabId
      onSelectLab()
      getTestParamConfig()
    }
  }
}

function disabledDate(val: any) {
  return dayjs(val).valueOf() < dayjs(new Date()).startOf('day').valueOf()
}

function onSelectPerson(rows: IUserSelectVoEntity[]) {
  const row = rows[0]

  selectedPerson.value = {
    id: row.id,
    name: row.name,
  }

  formState.value.resUserId = row.id
  setPersonSelectorVisible(false)

  formRef.value.validate('resUserId')
}

function onSelectTestTask(rows: TestTaskDataItem[]) {
  const row = rows[0]

  selectedTestTask.value = row
  formState.value.taskId = row.id

  getTestParamConfig()
}

function getTemHumVal(val: any, newVal: any, type: any) {
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

async function getFormData() {
  return new Promise((resolve, reject) => {
    formRef.value.validateFields().then(() => {
      if (+new Date(formState.value.endDate as string) <= +new Date(formState.value.startDate as string)) {
        Modal.info({
          title: '提示',
          content: '结束时间必须大于开始时间！',
        })
        return
      }

      if (formState.value.tem && formState.value.maxTem && formState.value.tem > formState.value.maxTem) {
        Modal.info({
          title: '提示',
          content: '目标温度，最小温度不能大于最大温度！',
        })
        return
      }

      if (formState.value.hum && formState.value.maxHum && formState.value.hum > formState.value.maxHum) {
        Modal.info({
          title: '提示',
          content: '目标湿度，最小湿度不能大于最大湿度！',
        })
        return
      }

      if (formState.value.laboratoryIotEqId) {
        const iotItem = iotEqList.value.find(i => i.value === formState.value.laboratoryIotEqId)
        if (iotItem) {
          formState.value.boxName = iotItem.label
        }
        else {
          formState.value.boxName = ''
        }
      }

      if (formState.value.laboratoryIotEqType === LaboratoryIotEqType.功能室) {
        formState.value.laboratoryIotEqId = undefined
      }
      else {
        formState.value.testParams = []
      }

      resolve(formState.value)
    }).catch((err: any) => {
      reject(err)
    })
  })
}

// 关闭弹窗
function reset() {
  formRef.value.resetFields()
  formState.value = new CreateHumitureResEntity()
  selectedLab.value = {} as any
}

defineExpose({
  selectedLab,
  formState,
  getFormData,
  getTestParamConfig,
  reset,
})
</script>
