<template>
  <HtModal
    v-model:open="showDialog"
    title="新增智能送样任务"
    width="750px"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleConfirm()"
  >
    <div class="pr-4">
      <a-card class="!mb-3">
        <IlisForm
          ref="formRef"
          :cols="1"
          :entity="SampleSendEntity"
          :init-data="initData"
          :field-list="fieldList"
          :label-col="{
            span: 7,
          }"
        >
          <template #labId="{ data }">
            <IlisInput
              v-model="data.labId"
              :options="laboratoryOptions"
              :entity="SampleSendEntity"
              field="labId"
              @change="handleLaboratoryChange"
            />
          </template>
        </IlisForm>
        <FormInner
          v-if="initData.appointmentTemperatureAndHumidity"
          ref="formRefTH"
          :default-lab-id="defaultLabId"
          :data-source="appointmentDataSource"
          :hide-fields="['taskId', 'laboratoryIotEqType', 'laboratoryId']"
        ></FormInner>
      </a-card>
      <a-space class="mb-3">
        <a-button type="primary" :icon="h(PlusOutlined)" @click="handleAddTask">
          新增
        </a-button>
      </a-space>
      <IlisTable
        :entity="TaskEntity"
        :data-source="choosedTasks"
        :field-list="['testTaskCode', 'testSampleDisplayName', 'testObjectCode', 'operation']"
      >
        <template #emptyText>
          <a-empty description="请至少选择一条任务"></a-empty>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" size="small" danger @click="handleDeleteTask(record as TaskEntity)">
              删除
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import TaskSelector from '~/components/selectorViaMethodCall/TaskSelector.vue'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook'
import FormInner from '~/views/common/humiture/res/components/FormInner.vue'
import { TaskEntity } from '../../TaskEntity'
import { addSampleSendTask } from '../api'
import { ESampleSendType, SampleSendEntity } from '../SampleSendEntity'

interface IProps {
  canChooseTask?: boolean
  taskList?: TaskEntity[]
}

/** 带参数的弹窗props */
const props = defineProps<IDialogPropsParam<null, IProps>>()

const showDialog = ref(true)

const formRef = ref<IlisFormExpose<SampleSendEntity>>()

const formRefTH = ref()

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const initData = ref(SampleSendEntity.fromJSON({}))

const defaultLabId = ref('')

const appointmentDataSource = ref<any>(null)

const loading = ref(false)

const choosedTasks = ref<TaskEntity[]>(props.param?.taskList || [])

const fieldList = computed(() => {
  if (initData.value.taskType === ESampleSendType.Appointment) {
    return SampleSendEntity.getFormFieldList()
  }
  return SampleSendEntity.getFormFieldList()?.filter(item => !['requestDeliveryTime'].includes(item))
})

watch(() => initData.value, () => {
  nextTick(() => {
    if (formRefTH.value?.formState) {
      formRefTH.value.formState.laboratoryId = defaultLabId.value
      formRefTH.value.formState.taskId = initData.value.taskId
      formRefTH.value.selectedLab = laboratoryOptions.value.find(i => i.value === defaultLabId.value) || {}
      formRefTH.value.getTestParamConfig()
    }
  })
}, { deep: true })

watch(() => initData.value.appointmentTemperatureAndHumidity, (val) => {
  if (val && initData.value.taskType === ESampleSendType.Appointment) {
    nextTick(() => {
      formRefTH.value.formState.startDate = dayjs(initData.value.requestDeliveryTime).format('YYYY-MM-DD HH:mm:ss')
    })
  }
})

function handleLaboratoryChange(val: string) {
  nextTick(() => formRef.value?.handleChange(val, 'labId'))
  defaultLabId.value = val
  const lab = laboratoryOptions.value.find(item => item.id === val)
  initData.value.labName = lab?.name || ''
}

/** 新增任务 */
async function handleAddTask() {
  const res = await AnyDialogHelper.showSelector<TaskEntity>(TaskSelector, {
    multiple: true,
    isCacheSelect: true,
    checkedRows: choosedTasks.value,
    payload: {
      type: 1,
      queryScope: 'user',
      dataType: 1,
    },
  })
  // res?.forEach((i) => {
  //   if (!choosedTasks.value.find(j => j.id === i.id)) {
  //     choosedTasks.value.push(i)
  //   }
  // })
  choosedTasks.value = res || []
}

/** 删除任务 */
function handleDeleteTask(record: TaskEntity) {
  Modal.confirm({
    title: '提示',
    content: `确认删除任务【${record.testTaskCode}】吗？`,
    centered: true,
    onOk: () => {
      choosedTasks.value = choosedTasks.value.filter(i => i.id !== record.id)
    },
  })
}

async function handleConfirm() {
  if (!choosedTasks.value?.length) {
    return message.warning('请至少选择一条任务')
  }
  const testTasks = choosedTasks.value.map((i) => {
    return {
      taskId: i.id,
      taskCode: i.testTaskCode,
      objectCode: i.testObjectCode,
      objectName: i.testSampleDisplayName,
    }
  })
  const [res, resTH] = await Promise.all([
    formRef.value!.getFormData(),
    formRefTH.value?.getFormData(),
  ])
  const query = {
    testTasks,
    ...res,
    ...(resTH
      ? { humitureResFrom: resTH }
      : {}),
  } as Record<string, any>
  if (initData.value.taskType !== ESampleSendType.Appointment) {
    delete query.requestDeliveryTime
  }
  if (query?.humitureResFrom?.testParams) {
    query.humitureResFrom.testParams = query?.humitureResFrom?.testParams?.join(',')
  }
  loading.value = true
  await addSampleSendTask(query).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  showDialog.value = false
  props.onConfirm(null)
}
</script>
