<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="样品制备登记"
      width="600px"
      :loading="loading"
      :confirm-loading="saveLoading"
      :after-close="onClosed"
      @ok="handleSubmit"
    >
      <a-alert type="info" show-icon class="!mb-4 !mt-3">
        <template #message>
          <p>若选择多个检测参数进行制备登记时：</p>
          <p>1、制备人员待选列表为当前任务的检测人员；</p>
        </template>
      </a-alert>
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="检测参数" name="paramIds">
          <a-select v-model:value="form.paramIds" mode="multiple" allow-clear placeholder="请选择检测参数">
            <a-select-option v-for="d in paramDatas" :key="d.id" :value="d.id">
              {{ d.paramName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="制备依据" name="standardIds">
          <a-flex :gap="2">
            <a-select v-model:value="form.standardIds" mode="multiple" allow-clear placeholder="请选择制备依据" @change="changeStandard">
              <a-select-option v-for="d in standardDatas" :key="d.id" :value="d.id">
                {{ d.standardName }} {{ d.standardPublishCode || '' }}
              </a-select-option>
            </a-select>
            <a-button type="primary" @click="standardVisible = true">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
        <a-form-item label="制备人员" name="personIds">
          <a-select v-model:value="form.personIds" mode="multiple" allow-clear placeholder="请选择制备人员">
            <a-select-option v-for="d in personIdDatas" :key="d.id" :value="d.id">
              {{ d.personName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="使用设备" name="equipmentIds">
          <a-flex :gap="2">
            <a-select v-model:value="form.equipmentIds" mode="multiple" allow-clear placeholder="请选择使用设备" @change="changeEquipment">
              <a-select-option v-for="d in equipmentDatas" :key="d.id" :value="d.id">
                {{ d.equipmentName }}{{ d.equipmentCode ? `（${d.equipmentCode}）` : '' }}
              </a-select-option>
            </a-select>
            <a-button type="primary" @click="equipmentVisible = true">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
        <a-form-item label="制备日期" name="preparationDate">
          <a-date-picker v-model:value="form.preparationDate" allow-clear value-format="YYYY-MM-DD" style="width: 100%" placeholder="请选择制备日期" />
        </a-form-item>
        <a-form-item label="制备描述" name="description">
          <a-textarea v-model:value="form.description" allow-clear placeholder="请输入制备描述" />
        </a-form-item>
      </a-form>
    </ht-modal>

    <!-- 选择制备依据 -->
    <SelectedStandard v-model:open="standardVisible" :check-whether-this-unit="false" @select="standardSelectorCallback" />
    <!-- 选择设备 -->
    <DeviceSelector v-model:show="equipmentVisible" multiple @confirm="equipmentSelectorCallback" />
  </div>
</template>

<script setup lang='ts'>
import type { Equipments, IAdd, Params, Person, Standard } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { StandardDatas } from '~/views/unit-config/standard'
import { message } from 'ant-design-vue'
import DeviceSelector from '~/components/DeviceSelector.vue'
import { SelectedStandard } from '~/views/unit-config/standard'
import { sp_add, sp_getDetailData, sp_getParams, sp_getPersons, sp_update } from '../api'

interface PropParam {
  id?: string
  taskId: string
}

const props = defineProps<IDialogPropsParam<null, PropParam>>()
const visible = ref(true)
const loading = ref(false)
const rules = {
  paramIds: [{ required: true, message: '请选择检测参数' }],
  standardIds: [{ required: true, message: '请选择制备依据' }],
  personIds: [{ required: true, message: '请选择制备人员' }],
  preparationDate: [{ required: true, message: '请选择制备日期' }],
}
const formRef = ref()
const form = ref<IAdd>({
  taskId: '',
  paramIds: [],
  standardIds: [],
  personIds: [],
  equipmentIds: [],
  preparationDate: '',
})
const paramDatas = ref<Params[]>([])
const standardDatas = ref<Standard[]>([])
const personIdDatas = ref<Person[]>([])
const equipmentDatas = ref<Equipments[]>([])

onMounted(() => {
  getDetailData()
  getParams()
  getPersons()
})

async function getDetailData() {
  try {
    if (!props.param.id)
      return
    loading.value = true
    const { data } = await sp_getDetailData(props.param.id)
    standardDatas.value = data.standards
    equipmentDatas.value = data.equipments

    form.value.paramIds = data.params.map(item => item.id)
    form.value.personIds = data.persons.map(item => item.id)
    form.value.standardIds = data.standards.map(item => item.id)
    form.value.equipmentIds = data.equipments.map(item => item.id)
    form.value.taskId = data.taskId
    form.value.preparationDate = data.preparationDate
    form.value.description = data.description
  }
  finally {
    loading.value = false
  }
}

/** 获取检测参数 */
async function getParams() {
  try {
    loading.value = true
    const { data } = await sp_getParams(props.param.taskId)
    paramDatas.value = data || []
    loading.value = false
  }
  finally {
    loading.value = false
  }
}

/** 获取制备人员 */
async function getPersons() {
  try {
    loading.value = true
    const { data } = await sp_getPersons(props.param.taskId)
    personIdDatas.value = data
  }
  finally {
    loading.value = false
  }
}

/** 选择设备 */
const equipmentVisible = ref(false)
function equipmentSelectorCallback(rows: any[]) {
  const ids = form.value.equipmentIds
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (ids.includes(row.id))
      continue

    equipmentDatas.value.push({
      id: row.id,
      equipmentName: row.name,
      equipmentCode: row.equipmentSn,
    })
    form.value.equipmentIds.push(row.id)
  }
  equipmentVisible.value = false
  formRef.value.validate('equipmentIds')
}
function changeEquipment() {
  equipmentDatas.value = equipmentDatas.value.filter(d => form.value.equipmentIds.includes(d.id))
}

/** 选择规程 */
const standardVisible = ref(false)
function standardSelectorCallback(rows: StandardDatas[]) {
  const ids = form.value.standardIds
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (ids.includes(row.standardId))
      continue

    standardDatas.value.push({
      id: row.standardId,
      standardName: row.standardName,
      standardPublishCode: row.publishCode,
    })
    form.value.standardIds.push(row.standardId)
  }
  standardVisible.value = false
  formRef.value.validate('standardIds')
}
function changeStandard() {
  standardDatas.value = standardDatas.value.filter(d => form.value.standardIds.includes(d.id))
}

/** 保存 */
const saveLoading = ref(false)
async function handleSubmit() {
  try {
    await formRef.value.validate()
    saveLoading.value = true
    const param = { ...form.value, taskId: props.param.taskId }
    if (props.param.id) {
      param.id = props.param.id
      await sp_update(param)
    }
    else {
      await sp_add(param)
    }
    message.success('保存成功')
    visible.value = false
    props.onConfirm(null)
  }
  finally {
    saveLoading.value = false
  }
}
</script>

<style scoped>
p{
  margin: 0
}
:deep(.ant-select-selection-item){
  align-items: center;
}
input{
  height: inherit;
}
</style>
