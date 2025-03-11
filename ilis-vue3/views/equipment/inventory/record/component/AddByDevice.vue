<template>
  <HtModal
    v-model:open="visible"
    :title="param.isDetail ? '详情' : (param.data.id ? '编辑' : '新增')"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
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
        :entity="EquipmentAssetEntity"
        :field-list="['quickQry', 'type']"
        :field-order="['quickQry', 'type']"
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
import { cloneDeep } from '@unovis/ts'
import { EquipmentInventoryRecordEntity } from '../EquipmentInventoryRecordEntity'
import { saveEquipmentInventoryRecord } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import { getOrgComboTree } from '~/api/common'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { EquipmentAssetEntity } from '~/views/equipment/asset/EquipmentAssetEntity'
import AssetSelector from '~/components/selectorViaMethodCall/AssetSelector.vue'

interface IDialogProps {
  data: EquipmentInventoryRecordEntity
  isDetail?: boolean
  initDevice?: EquipmentAssetEntity[]
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentInventoryRecordEntity>(props.param.data)

const ilisFormRef = ref<IlisFormExpose<EquipmentInventoryRecordEntity>>()

const selData = ref<EquipmentAssetEntity[]>([])

const treeData = ref<IDepartmentEntity[]>([])

const {
  dataSource,
  dataSourceAll,
  getList,
  selectedRows,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleDelete,
  handleSearch,
  handleReset,
} = useLocalTableHooks<EquipmentAssetEntity>({
  dataSource: selData,
  immediate: false,
  quickQueryMap: ['quickQry', ['assetSn', 'equipmentSn', 'name', 'factory', 'standard']],
})

async function init() {
  getTreeData()
  if (props.param.initDevice?.length) {
    selData.value = props.param.initDevice
    getList()
  }
}
init()

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

/**
 * # 选择设备
 */
async function handleSelectDevice() {
  const data = await AnyDialogHelper.showSelector<EquipmentAssetEntity>(AssetSelector, {
    multiple: true,
    // isCacheSelect: true,
  })
  const addData = data.filter((item) => {
    return !selData.value.some(i => i.id === item.id)
  })
  selData.value = [...selData.value, ...EquipmentAssetEntity.fromJsonArray(cloneDeep(addData))]
  getList()
}

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  if (!dataSourceAll.value?.length) {
    message.warning('请选择设备！')
    return
  }
  loading.value = true
  await saveEquipmentInventoryRecord({
    ...formData!,
    type: formData!.inventoryType,
    assetIds: dataSourceAll.value?.map(i => i.id),
  }).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
