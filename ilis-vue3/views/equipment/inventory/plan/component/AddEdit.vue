<template>
  <HtModal
    v-model:open="visible"
    :title="param.isDetail ? '详情' : (param.data.id ? '编辑' : '新增')"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="pr-3">
      <BaseTitle>盘点基础信息</BaseTitle>
      <IlisForm
        :key="initData.planTime?.length"
        ref="ilisFormRef"
        :cols="2"
        :entity="EquipmentInventoryPlanEntity"
        :init-data="initData"
        :disabled="param?.isDetail"
        :field-order="['inventoryName']"
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
          hide-advanced-search
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
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { cloneDeep } from '@unovis/ts'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { EquipmentInventoryPlanEntity } from '../EquipmentInventoryPlanEntity'
import { addEquipmentInventoryPlan, editEquipmentInventoryPlan, getEquipmentInventoryPlanDetail, getEquipmentInventoryPlanEqDetail } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import { getOrgComboTree } from '~/api/common'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import AssetSelector from '~/components/selectorViaMethodCall/AssetSelector.vue'
import { EquipmentAssetEntity } from '~/views/equipment/asset/EquipmentAssetEntity'

interface IDialogProps {
  data: EquipmentInventoryPlanEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentInventoryPlanEntity>(props.param.data)

const ilisFormRef = ref<IlisFormExpose<EquipmentInventoryPlanEntity>>()

const selData = ref([] as EquipmentAssetEntity[])

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
  if (props.param.data.id) {
    // 盘点计划基础信息详情
    getBaseData(props.param.data)
    // 盘点计划设备详情
    getDeviceList(props.param.data)
  }
}
init()

/**
 * 盘点计划基础信息详情
 */
async function getBaseData(query: EquipmentInventoryPlanEntity) {
  const { data } = await getEquipmentInventoryPlanDetail(query)
  initData.value = EquipmentInventoryPlanEntity.fromJSON(data)
  if (data.planTimeBegin && data.planTimeEnd) {
    initData.value.planTime = [data.planTimeBegin, data.planTimeEnd]
  }
}

/**
 * # 盘点计划设备详情
 */
async function getDeviceList(query: EquipmentInventoryPlanEntity) {
  const { data } = await getEquipmentInventoryPlanEqDetail(query)
  if (data?.length) {
    selData.value = EquipmentAssetEntity.fromJsonArray(data)
    getList()
  }
}

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
  const param = {
    ...formData,
    planTimeBegin: formData?.planTime?.[0],
    planTimeEnd: formData?.planTime?.[1],
    assetIds: dataSourceAll.value?.map(i => i.id),
  }
  delete param.planTime
  if (props.param.data?.id) {
    await editEquipmentInventoryPlan(param).finally(() => {
      loading.value = false
    })
  }
  else {
    await addEquipmentInventoryPlan(param).finally(() => {
      loading.value = false
    })
  }
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
