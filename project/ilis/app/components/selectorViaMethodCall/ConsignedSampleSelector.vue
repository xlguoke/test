<!-- 引用已委托原材料选择器 -->
<!-- 该选择器payload参数consignId,testObjectId,unitId -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '引用已委托原材料'"
    fixed-height
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <BaseSpinWrapper>
      <div class="flex justify-between w-full">
        <IlisFormSearch
          :entity="ConsignedSampleEntity"
          :init-data="initData"
          :field-list="searchFieldList"
          @search="handleSearch"
          @reset="handleReset"
        >
        </IlisFormSearch>
        <div class="whitespace-nowrap pt-1">
          <a-checkbox
            v-model:checked="isCheckAll"
            @change="handleReloadTable"
          >
            显示全部数据
          </a-checkbox>
        </div>
      </div>
      <div ref="tableBoxRef" class="flex gap-2 w-full flex-1 h-0">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          :table-height="tableHeight"
          resizable
          :loading="loading"
          :entity="ConsignedSampleEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow()"
          :field-list="fieldList"
          @change="handleSortChange"
        >
        </IlisTable>
        <BaseSelectorView
          v-if="multiple && isCacheSelect"
          :data="AnyDataTransformHelper.recordListToOptions(selectedRows, ['testSampleDisplayName', 'id'])"
          empty-text="未选择已委托原材料"
          @remove-item="handleRemoveItem"
          @remove-all="selectedRows = [];selectedRowKeys = [];"
        />
      </div>
    </BaseSpinWrapper>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'
import { message } from 'ant-design-vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { consignedSampleApi } from '~/api/sample'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useSystemParamStore } from '~/store/systemParamStore'
import EditExternalObjectModal from '~/views/consign/consignDetail/components/sample/EditExternalObjectModal.vue'
import { ConsignedSampleEntity } from './entity/ConsignedSampleEntity'

const props = defineProps<IDialogPropsSelector<ConsignedSampleEntity>>()

const { systemParams } = useSystemParamStore()

const internalOpen = ref(true)

const isCheckAll = ref(false)

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
  handleReloadTable,
} = useTableHooks<ConsignedSampleEntity>({
  api: consignedSampleApi,
  sizeKey: 'rows',
  payload: {
    consignId: props.payload?.consignId,
    testObjectId: props.payload?.testObjectId,
    sort: 'createDate',
    order: 'desc',
  },
  isCacheSelect: props.isCacheSelect,
  immediate: !props.unImmediate,
  beforeSearch(params) {
    if (isCheckAll.value) {
      params.unitId = null
    }
    else {
      params.unitId = props.payload?.unitId
    }
    return params
  },
  responseDataTransform(res) {
    res?.rows?.forEach((item: ConsignedSampleEntity) => {
      item.id = `${item.consignId}-${item.testObjectId}`
    })
    return res
  },
})

if (props.checkedRows) {
  selectedRows.value = props.checkedRows
  selectedRowKeys.value = props.checkedRows.map(d => d.id)
}

const fieldList = computed(() => {
  if (systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE) {
    return ConsignedSampleEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))
  }
  return ConsignedSampleEntity.getTableFieldList()?.filter(item => !['operation', 'provideToCustomerSampleCode'].includes(item))
})

const searchFieldList = computed(() => {
  if (systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE) {
    return ConsignedSampleEntity.getSearchFileldList()
  }
  return ConsignedSampleEntity.getSearchFileldList()?.filter(item => !['provideToCustomerSampleCode'].includes(item))
})

/** # 确认 */
async function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择已委托原材料')
  }

  const datas: any[] = await AnyDialogHelper.showModel(EditExternalObjectModal, {
    title: '编辑引入原材料其他信息',
    datas: selectedRows.value,
  })
  if (!datas)
    return

  const saveData = datas.map((item) => {
    const meta = JSON.parse(item.meta)
    return {
      ...meta,
      recommendedDosage: item.recommendedDosage,
      dosage: item.dosage,
      unitRatio: item.unitRatio,
      remark: item.remark,
      parentSampleId: '',
      otherMaterials: [],
      accessories: [],
      status: undefined,
      type: Number(item.type || 1),
    }
  })

  props.onConfirm(saveData)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
