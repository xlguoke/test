<template>
  <HtModal
    v-model:open="visible"
    :title="param.isDetail ? '详情' : (param.data.id ? '编辑' : '新增')"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
    @cancel="onConfirm(null)"
  >
    <BaseTitle>盘点基础信息</BaseTitle>
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="2"
      :entity="EquipmentInventoryRecordEntity"
      :init-data="initData"
      :disabled="param?.isDetail"
      :field-order="['inventoryName', 'inventorySn', 'description', 'inventoryType']"
      :label-col="{
        style: { width: '120px' },
      }"
    >
      <template #inventorySn="{ data }">
        <a-input v-model:value="data.inventorySn" disabled placeholder="保存后自动生成"></a-input>
      </template>
    </IlisForm>
    <BaseTitle>盘点资产信息</BaseTitle>
    <a-space direction="vertical">
      <IlisFormSearch
        :entity="InventoryDeviceEntity"
        :field-list="['queryCode', 'type']"
        :field-order="['queryCode', 'type']"
        @reset="handleReset"
        @search="handleSearch"
      >
      </IlisFormSearch>
      <a-space v-if="!param.isDetail">
        <a-button
          :icon="h(PlusOutlined)"
          @click="handleSelectDevice"
        >
          添加资产
        </a-button>
        <a-button
          :icon="h(DeleteOutlined)"
          @click="handleDelete(selectedRows)"
        >
          删除
        </a-button>
      </a-space>
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :entity="EquipmentAssetEntity"
        :field-list="['name', 'equipmentSn', 'assetSn', 'standard', 'buyDate', 'departName', 'type', 'userName', 'quantity', 'factory']"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow"
      >
      </IlisTable>
    </a-space>
  </HtModal>
</template>

<script lang="ts" setup>
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { EquipmentInventoryRecordEntity } from '../EquipmentInventoryRecordEntity'
import { addEquipmentInventoryCheckInEq, delEquipmentInventoryCheckInEq, editEquipmentInventoryRecord, getEquipmentInventoryCheckInEq, getEquipmentInventoryRecordDetail } from '../api'
import { InventoryDeviceEntity } from '../InventoryDeviceEntity'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BaseTitle } from '~/components/UI'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import { getOrgComboTree } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { EquipmentAssetEntity } from '~/views/equipment/asset/EquipmentAssetEntity'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import AssetSelector from '~/components/selectorViaMethodCall/AssetSelector.vue'

interface IDialogProps {
  data: EquipmentInventoryRecordEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const visible = ref(true)

const initData = ref<EquipmentInventoryRecordEntity>(props.param.data)

const ilisFormRef = ref<IlisFormExpose<EquipmentInventoryRecordEntity>>()

const treeData = ref<IDepartmentEntity[]>([])

const {
  loading,
  dataSource,
  selectedRows,
  getList,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleDelete,
  handleSearch,
  handleReset,
} = useTableHooks<EquipmentAssetEntity>({
  api: getEquipmentInventoryCheckInEq,
  delApi: delEquipmentInventoryCheckInEq,
  totalKey: 'count',
  payload: {
    inventoryId: props.param.data?.id,
  },
  responseDataTransform: (data) => {
    data?.rows?.forEach((item: any) => {
      item.name = item.equipmentName
      item.standard = item.equipmentStandard
    })
    return data
  },
})

async function init() {
  getTreeData()
  if (props.param.data.id) {
    // 盘点记录基础信息详情
    getBaseData(props.param.data)
  }
}
init()

/**
 * 盘点记录基础信息详情
 */
async function getBaseData(query: EquipmentInventoryRecordEntity) {
  const { data } = await getEquipmentInventoryRecordDetail(query)
  data.inventoryType = data.type
  initData.value = EquipmentInventoryRecordEntity.fromJSON(data)
}

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

/**
 * # 选择资产
 */
async function handleSelectDevice() {
  const data = await AnyDialogHelper.showSelector<EquipmentAssetEntity>(AssetSelector, {
    multiple: true,
  })
  const ids = data.map(item => item.id)
  await addEquipmentInventoryCheckInEq({ inventoryId: initData.value.id, assetIds: ids })
  message.success('添加成功')
  getList()
}

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  if (!dataSource.value?.length) {
    message.warning('请选择资产！')
    return
  }
  loading.value = true
  await editEquipmentInventoryRecord({
    ...formData!,
    type: formData!.inventoryType,
  }).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
