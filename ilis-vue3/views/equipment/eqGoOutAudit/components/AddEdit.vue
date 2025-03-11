<template>
  <ht-modal
    v-model:open="visible"
    title="新增"
    width="800px"
    :loading="spinning"
    :confirm-loading="loading"
    :after-close="onClosed"
    @cancel="cancel"
    @ok="saveData"
  >
    <a-card :body-style="{ padding: '12px' }">
      <template #title>
        <div class="flex items-center justify-between w-full">
          外出设备
          <a-input-group compact style="width: 400px;">
            <a-input
              v-model:value="equipmetSn"
              placeholder="请输入设备编号、设备标签码或扫描设备标签码添加"
              style="width: 340px;"
              @keypress.enter="addEquipmentByCode"
            />
            <a-button type="primary" @click="addEquipmentByCode">
              添加
            </a-button>
          </a-input-group>
        </div>
      </template>
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
    </a-card>
    <a-card title="外出信息" class="mt-2">
      <AddEditForm ref="formRef" :form-data="formData" />
    </a-card>
  </ht-modal>

  <!-- 选择设备 -->
  <DeviceSelector
    v-model:show="eqVisible"
    multiple
    :payload="{ egressStatus: '10,30' }"
    show-sub-device
    @confirm="selectedEquipment"
  >
  </DeviceSelector>
</template>

<script setup lang='ts'>
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { addEquipmentApi, detailApi, queryEquipmentApi, removeEquipmentApi, saveApi } from '../api'
import type { EqGoOutAuditEntity } from '../'
import AddEditForm from './AddEditForm.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import DeviceSelector from '~/components/DeviceSelector.vue'

interface EqDatas {
  id: string
  equipmentName: string
  equipmentSn: string
  standard: string
}

export interface PropsParam {
  entity?: EqGoOutAuditEntity
  editType?: 'edit' | 'detail'
}

const props = defineProps<IDialogPropsParam<null, PropsParam | undefined>>()

const visible = ref(true)
const spinning = ref(false)
const loading = ref(false)
const formData = ref()
const formRef = ref()
const equipmentList = ref<EqDatas[]>([])
const disabled = ref(false)

function cancel() {
  visible.value = false
}

onMounted(() => {
  const { entity, editType } = props.param || {}
  if (entity && entity.egressApplyId)
    getData(entity.egressApplyId)

  disabled.value = editType === 'detail'
})

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

async function getData(id: string) {
  spinning.value = true
  const { data } = await detailApi(id)
  spinning.value = false
  formData.value = data
  equipmentList.value = data.equipments.map((e: any) => ({
    id: e.id,
    equipmentName: e.name,
    equipmentSn: e.equipmentSn,
    standard: e.standard,
  }))
}

async function saveData() {
  if (equipmentList.value.length === 0) {
    message.warning('请选择外出设备')
    return
  }

  const form = await formRef.value.getFormData()
  if (!form)
    return
  loading.value = true
  form.equipmentIds = equipmentList.value.map(e => e.id)
  await saveApi(form).finally(() => {
    loading.value = false
  })
  message.success('保存成功!')
  props.onConfirm(null)
  visible.value = false
}

const eqVisible = ref(false)
/** 选择设备 */
function addEquipment() {
  eqVisible.value = true
}
/** 选择设备回调 */
function selectedEquipment(datas: IDeviceEntity[]) {
  eqVisible.value = false
  const addEqs: EqDatas[] = []
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
  // 编辑时，实时保存数据，避免移除设备后，设备状态未变更，导致无法选择设备
  if (formData.value && formData.value.id && addEqs.length > 0) {
    addEquipmentApi({
      id: formData.value.id,
      equipmentIds: addEqs.map(d => d.id),
    }).then(() => {
      message.success('添加成功')
      equipmentList.value.push(...addEqs)
    })
  }
  else {
    equipmentList.value.push(...addEqs)
  }
}

/** 删除已选择的设备 */
async function removeRow(ind: number) {
  const item = equipmentList.value[ind]
  // 编辑时，实时保存数据，避免移除设备后，设备状态未变更，导致无法选择设备
  if (formData.value && formData.value.id) {
    await removeEquipmentApi({
      id: formData.value.id,
      equipmentIds: [item.id],
    })
  }
  equipmentList.value.splice(ind, 1)
}

const equipmetSn = ref('')
async function addEquipmentByCode() {
  if (!equipmetSn.value) {
    message.warning('请输入设备编号、设备标签码或扫描设备标签码')
    return ''
  }
  const eqSn = equipmetSn.value
  equipmetSn.value = ''
  const { data } = await queryEquipmentApi(eqSn)
  const eqIds = equipmentList.value.map(e => e.id)
  const repeats = []
  const unValidStatus = []
  const addData = []
  for (let i = 0; i < data.length; i++) {
    const d = data[i]
    const sn = d.equipmentSn ? `（${d.equipmentSn}）` : ''
    const msg = `${d.name}${sn}`
    if (eqIds.includes(d.id)) {
      repeats.push(msg)
    }
    else if (d.egressStatus !== '10' && d.egressStatus !== '30') {
      unValidStatus.push(msg)
    }
    else {
      addData.push(d)
    }
  }
  selectedEquipment(addData)
  if (repeats.length > 0 || unValidStatus.length > 0) {
    const repeatStr = repeats.join(',')
    const unValidStr = unValidStatus.join(',')
    let str = ''
    if (repeatStr)
      str = `【${repeatStr}】已存在，无需重复添加！`
    if (unValidStr)
      str += `【${unValidStr}】当前状态无法外出！`
    message.warning(str)
  }
}
</script>

<style>

</style>
