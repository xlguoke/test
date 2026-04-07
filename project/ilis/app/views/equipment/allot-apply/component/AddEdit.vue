<template>
  <HtModal
    v-model:open="visible"
    :title="param.data.id ? '编辑申请' : '新增申请'"
    width="80%"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <BaseTitle>2</BaseTitle>
    <IlisForm
      ref="ilisFormRef"
      :cols="2"
      :entity="EquipmentAllotApplyEntity"
      :init-data="initData"
      :label-col="{
        style: { width: '120px' },
      }"
    >
      <template #uploadQR="{ data }">
        <HtUploadFile
          :business-type="allotConfig[param.type].attachmentKey"
          force-init
          :business-id="initData.id"
          @get-qr-code-key="data.uploadQR = $event"
        />
      </template>
    </IlisForm>
    <IlisCustomPropertiesForm
      ref="customizeFormRef"
      :customize-type="allotConfig[param.type].customPropertiesKey"
      :cols="2"
      :default-value="initData.customizeValues"
      :label-col="{
        style: { width: '100px' },
      }"
    />
    <BaseTitle>{{ allotConfig[param.type].moduleName }}信息</BaseTitle>
    <a-button
      :icon="h(PlusOutlined)"
      class="mb-2"
      @click="handleAddDevice"
    >
      添加{{ allotConfig[param.type].moduleName }}
    </a-button>
    <IlisTable
      show-index
      :data-source="initData.eqList"
      :entity="DeviceEntity"
      :field-list="['name', 'equipmentSn', 'assetSn', 'standard', 'status', 'operation']"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.dataIndex === 'operation'">
          <a-button
            type="link"
            size="small"
            @click="handleDelete(record as DeviceEntity)"
          >
            移除
          </a-button>
        </div>
      </template>
    </IlisTable>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { TreeOption } from '~/anyThing/model/AnyBaseModel'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { HtUploadFile } from '~/components/htUploadFile'
import AssetSelector from '~/components/selectorViaMethodCall/AssetSelector.vue'
import VMCallDeviceSelector from '~/components/selectorViaMethodCall/VMCallDeviceSelector.vue'
import { AllotType } from '~/enum/AllotType'
import { EquipmentAssetEntity } from '../../asset/EquipmentAssetEntity'
import { DeviceEntity } from '../../DeviceEntity'
import { addEquipmentAllot, editEquipmentAllot, getEquipmentAllotDetail } from '../api'
import { allotConfig, EquipmentAllotApplyEntity } from '../EquipmentAllotApplyEntity'

const props = defineProps<IDialogPropsParam<null, { type: AllotType, data: EquipmentAllotApplyEntity }>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentAllotApplyEntity>(props.param.data)

const ilisFormRef = ref<InstanceType<typeof IlisForm>>()

const customizeFormRef = ref<InstanceType<typeof IlisCustomPropertiesForm>>()

async function init() {
  if (props.param.data.id) {
    const { data } = await getEquipmentAllotDetail(props.param.data)
    initData.value = EquipmentAllotApplyEntity.fromJSON(data)
  }
}
init()

async function handleAddDevice() {
  if (!initData.value.outDepartId) {
    message.warning(`请先选择${initData.value.getFormFieldLabel('outDepartId')}`)
    return
  }

  function _getDepartLabel(treeData: TreeOption[], key: string): string {
    for (const item of treeData) {
      if (item.value === key) {
        return item.label
      }
      if (item.children) {
        const foundLabel = _getDepartLabel(item.children, key)
        if (foundLabel) {
          return foundLabel
        }
      }
    }
    return ''
  }

  const departOption = initData.value.getTreeOptions('outDepartId')
  const departLabel = _getDepartLabel(departOption, initData.value.outDepartId)

  const view = props.param.type === AllotType.EQUIPMENT ? VMCallDeviceSelector : AssetSelector
  const searchInit = props.param.type === AllotType.EQUIPMENT
    ? DeviceEntity.fromJSON({ eqDepartId: initData.value.outDepartId })
    : EquipmentAssetEntity.fromJSON({ departId: initData.value.outDepartId })

  const res = await AnyDialogHelper.showSelector(view, {
    multiple: true,
    isCacheSelect: true,
    checkedRows: initData.value.eqList,
    title: `请选择【${departLabel}】的${allotConfig[props.param.type].moduleName}`,
    initData: searchInit,
    unImmediate: true,
  })
  if (res) {
    initData.value.eqList = res
  }
}

function handleDelete(record: DeviceEntity) {
  initData.value.eqList = initData.value.eqList.filter((item: DeviceEntity) => item.id !== record.id)
}

async function handleOk() {
  if (!initData.value?.eqList?.length) {
    return message.warning(`请添加${allotConfig[props.param.type].moduleName}`)
  }
  const formData = await ilisFormRef.value?.getFormData() as EquipmentAllotApplyEntity
  const customizeValues = await customizeFormRef.value?.getFormData()
  formData!.customizeValueStr = JSON.stringify(customizeValues)
  formData!.eqIds = initData.value.eqList.map((item: DeviceEntity) => item.id)
  loading.value = true
  const api = props.param.data.id ? editEquipmentAllot : addEquipmentAllot

  await api(props.param.type, formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
