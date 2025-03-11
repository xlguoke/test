<template>
  <div>
    <a-modal
      v-model:open="open"
      title="预约功能室"
      width="460px"
      :mask-closable="false"
      destroy-on-close
      :confirm-loading="submitLoading"
      centered
      @cancel="cancel"
    >
      <a-form
        ref="formRef"
        :rules="rules"
        :model="formState"
        class="pt-4 max-h-[80vh] overflow-auto"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="任务">
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
        <a-form-item label="预约类型">
          <a-radio-group v-model:value="formState.laboratoryIotEqType" :disabled="isDetail">
            <a-radio
              v-for="item in LaboratoryIotEqTypeDict"
              :key="item.key"
              :value="item.key"
            >
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="功能室" name="laboratoryId" :rules="[{ required: true, message: '请选择功能室！' }]">
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
        <a-form-item v-if="formState.laboratoryId && formState.taskId && formState.laboratoryIotEqType === LaboratoryIotEqType.功能室" label="试验参数">
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
          <a-input-number
            v-model:value="formState.tem"
            placeholder="最小温度"
            :min="selectedLab.minConTem"
            :max="selectedLab.maxConTem"
            :disabled="isDetail"
          />
          ~
          <a-input-number
            v-model:value="formState.maxTem"
            placeholder="最大温度"
            :min="selectedLab.minConTem"
            :max="selectedLab.maxConTem"
            :disabled="isDetail"
          />
        </a-form-item>
        <a-form-item v-if="formState.laboratoryIotEqType === LaboratoryIotEqType.功能室" label="目标湿度（%RH）" name="hum">
          <a-input-number
            v-model:value="formState.hum"
            placeholder="最小湿度"
            :min="selectedLab.minConHum"
            :max="selectedLab.maxConHum"
            :disabled="isDetail"
          />
          ~
          <a-input-number
            v-model:value="formState.maxHum"
            placeholder="最大湿度"
            :min="selectedLab.minConHum"
            :max="selectedLab.maxConHum"
            :disabled="isDetail"
          />
        </a-form-item>
        <a-form-item label="结束时处理" name="customType" :rules="[{ required: true, message: '请选择结束时处理！' }]">
          <a-radio-group v-model:value="formState.customType" :disabled="isDetail">
            <a-radio v-for="item in CustomTypeDict" :key="item.key" :value="item.key">
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

      <template #footer>
        <a-button @click="cancel">
          {{ isDetail ? "关闭" : "取消" }}
        </a-button>
        <a-button
          v-if="!isDetail"
          type="primary"
          :loading="submitLoading"
          @click="onSubmit"
        >
          确定
        </a-button>
      </template>
    </a-modal>

    <!-- 选择人员 -->
    <PersonSelector v-model:show="personSelectorVisible" :checked-ids="[formState.resUserId]" @confirm="onSelectPerson" />

    <!-- 选择任务 -->
    <SelectTestTask v-model:open="selectTestTaskVisible" @on-select="onSelectTestTask" />
  </div>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { PropType } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import { getIots } from '../../displayDetails/api'
import SelectTestTask from './SelectTestTask.vue'
import { CreateHumitureResEntity, createHumitureRes } from '~/views/common/humiture/res/api/createHumitureRes.ts'
import { CustomTypeDict } from '~/views/common/humiture/res'
import { LaboratoryIotEqType, LaboratoryIotEqTypeDict } from '~/views/common/humiture/timer'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { editHumitureRes } from '~/views/common/humiture/res/api/editHumitureRes.ts'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import PersonSelector from '~/components/PersonSelector.vue'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import type { TestTaskDataItem } from '~/views/common/humiture/res/api/getTestTask.ts'
import type { IOption } from '~/interface/IOption'
import type { ParamHumConfigDTO } from '~/views/common/humiture/res/api/getTestParamConfig.ts'
import { getHumitureTestParamConfig } from '~/views/common/humiture/res/api/getTestParamConfig.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  defaultLabId: {
    type: String,
    default: null,
  },
  dataSource: {
    type: Object as PropType<CreateHumitureResEntity>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const [personSelectorVisible, setPersonSelectorVisible] = useStateHooks(false)

const [selectTestTaskVisible, setSelectTestTaskVisible] = useStateHooks(false)

const selectedPerson = ref({})

const selectedTestTask = ref({})

const localUserInfo = getLocalUserInfo()

const open = computed(() => props.open)

const isDetail = computed(() => !!(props.dataSource && !props.dataSource.id))

const isEdit = computed(() => !!(props.dataSource && props.dataSource.id))

const formRef = ref()

const submitLoading = ref(false)

const selectedLab = ref({})

const iotEqList = ref<IOption[]>([])

const testParamOptions = ref<IOption[]>([])

const paramHumConfig = ref<ParamHumConfigDTO[]>([])

const formState = ref(new CreateHumitureResEntity())

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

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    onOpen()
  }
})

function onSelectLab() {
  const item = laboratoryOptions.value.find(i => i.value === formState.value.laboratoryId)
  selectedLab.value = item || {}

  if (item) {
    getMaintenanceBox(item.iotEqId)
  }
}

async function getTestParamConfig(isEditInit = false) {
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

    clacDefaultHumiture()
  }
}

// 根据选择参数计算温湿度默认值
function clacDefaultHumiture() {
  if (formState.value.laboratoryIotEqType !== LaboratoryIotEqType.功能室) {
    return
  }

  let minTem = isDefined(selectedLab.value.minTemperature) ? selectedLab.value.minTemperature : null
  let maxTem = isDefined(selectedLab.value.maxTemperature) ? selectedLab.value.maxTemperature : null
  let minHum = isDefined(selectedLab.value.minHumidity) ? selectedLab.value.minHumidity : null
  let maxHum = isDefined(selectedLab.value.maxHumidity) ? selectedLab.value.maxHumidity : null

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
    getTestParamConfig(true)
  }
  else {
    selectedPerson.value = {
      id: localUserInfo?.userId,
      name: localUserInfo?.realName,
    }

    formState.value.resUserId = selectedPerson.value.id

    if (props.defaultLabId) {
      formState.value.laboratoryId = props.defaultLabId
      onSelectLab()
      getTestParamConfig()
    }
  }
}

function disabledDate(val) {
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

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    if (+new Date(formState.value.endDate as string) <= +new Date(formState.value.startDate as string)) {
      Modal.info({
        title: '提示',
        content: '结束时间必须大于开始时间！',
      })
      return
    }

    if (formState.value.tem > formState.value.maxTem) {
      Modal.info({
        title: '提示',
        content: '目标温度，最小温度不能大于最大温度！',
      })
      return
    }

    if (formState.value.hum > formState.value.maxHum) {
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

    submitLoading.value = true

    if (formState.value.laboratoryIotEqType === LaboratoryIotEqType.功能室) {
      formState.value.laboratoryIotEqId = undefined
    }
    else {
      formState.value.testParams = []
    }

    if (isEdit.value) {
      await editHumitureRes(props.dataSource.id, formState.value).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createHumitureRes(formState.value).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
  formState.value = new CreateHumitureResEntity()
  selectedLab.value = {}
}
</script>
