<!-- 外部样品选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择外部样品'"
    fixed-height
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <BaseSpinWrapper>
      <IlisFormSearch
        :entity="ExternalObjectEntity"
        :init-data="initData"
        :field-list="searchFieldList"
        @search="handleSearch"
        @reset="handleReset"
      >
      </IlisFormSearch>
      <a-alert
        show-icon
        type="info"
        message="注：外部委托编号为该外来样品在其他机构委托时的委托编号，本机构内委托编号为本机构录入该外来样品的委托编号"
      />
      <div ref="tableBoxRef" class="flex gap-2 w-full flex-1 h-0">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          :table-height="tableHeight"
          resizable
          :loading="loading"
          :entity="ExternalObjectEntity"
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
import { externalObjectApi } from '~/api/sample'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useSystemParamStore } from '~/store/systemParamStore'
import EditExternalObjectModal from '~/views/consign/consignDetail/components/sample/EditExternalObjectModal.vue'
import { ExternalObjectEntity } from './entity/ExternalObjectEntity'

const props = defineProps<IDialogPropsSelector<ExternalObjectEntity>>()

const { systemParams } = useSystemParamStore()

const internalOpen = ref(true)

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
} = useTableHooks<ExternalObjectEntity>({
  api: externalObjectApi,
  payload: props.payload,
  isCacheSelect: props.isCacheSelect,
  immediate: !props.unImmediate,
})

if (props.checkedRows) {
  selectedRows.value = props.checkedRows
  selectedRowKeys.value = props.checkedRows.map(d => d.id)
}

const fieldList = computed(() => {
  if (systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE) {
    return ExternalObjectEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))
  }
  return ExternalObjectEntity.getTableFieldList()?.filter(item => !['operation', 'provideToCustomerSampleCode'].includes(item))
})

const searchFieldList = computed(() => {
  if (systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE) {
    return ExternalObjectEntity.getSearchFileldList()
  }
  return ExternalObjectEntity.getSearchFileldList()?.filter(item => !['provideToCustomerSampleCode'].includes(item))
})

/** # 确认 */
async function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择外部样品')
  }

  const datas: ExternalObjectEntity[] = await AnyDialogHelper.showModel(EditExternalObjectModal, {
    datas: selectedRows.value,
  })
  if (!datas)
    return

  const saveData = datas.map((item) => {
    const d = ExternalObjectEntity.fromJSON(item)
    d.referred = true
    d.type = 3
    if (!d.mark)
      d.mark = generateGUID()
    return d
  })
  props.onConfirm(saveData)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
