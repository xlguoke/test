<template>
  <IlisContainer app-id="common_equipment_inspect_plan">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentInspectPlanEntity"
        :init-data="initSearch"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button
          @click="handleEdit(EquipmentInspectPlanEntity.fromJSON({}))"
        >
          新增
        </a-button>
        <a-button
          @click="handlePrint()"
        >
          打印
        </a-button>
        <IlisCustomColumns
          type="inspectPlan"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentInspectPlanEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: 'radio',
          })"
          :custom-row="getCustomRow()"
          :custom-columns="customColumns"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'planStatus'">
              <BaseStatusTag :color="EquipmentInspectPlanStatusDict.getColorByKey(text)">
                {{ EquipmentInspectPlanStatusDict.getLabelByKey(text) }}
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="[EquipmentInspectPlanStatus.WAIT_APPROVE, EquipmentInspectPlanStatus.APPROVE_FAIL].includes(record.planStatus)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentInspectPlanEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentInspectPlanStatus.APPROVE_ING, EquipmentInspectPlanStatus.APPROVE_SUCCESS].includes(record.planStatus)"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(AddEdit, { data: EquipmentInspectPlanEntity.fromJSON(record), isDetail: true })"
              >
                详情
              </a-button>
              <a-button
                v-if="[EquipmentInspectPlanStatus.WAIT_APPROVE, EquipmentInspectPlanStatus.APPROVE_FAIL].includes(record.planStatus)"
                type="link"
                size="small"
                @click="handleProcess([record] as EquipmentInspectPlanEntity[])"
              >
                提交审核
              </a-button>
              <a-button
                v-if="[EquipmentInspectPlanStatus.WAIT_APPROVE, EquipmentInspectPlanStatus.APPROVE_FAIL].includes(record.planStatus)"
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EquipmentInspectPlanEntity[], {
                  content: '删除后将无法恢复，您确定要删除当前的设备核查计划吗',
                })"
              >
                删除
              </a-button>
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '9' })">
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { delEquipmentInspectPlan, getEquipmentInspectPlanList, submitEquipmentInspectPlan } from './api'
import AddEdit from './component/AddEdit.vue'
import { EquipmentInspectPlanEntity, EquipmentInspectPlanStatus, EquipmentInspectPlanStatusDict } from './EquipmentInspectPlanEntity'

const {
  loading,
  dataSource,
  customColumns,
  selectedRowKeys,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleReset,
  handleSearch,
  handleDelete,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<EquipmentInspectPlanEntity>({
  api: getEquipmentInspectPlanList,
  delApi: delEquipmentInspectPlan,
  sizeKey: 'rows',
  customType: 'inspectPlan',
})

const initSearch = ref(new EquipmentInspectPlanEntity())

const urlSearch = new URLSearchParams(window.location.search)
const upkeepPlanSn = urlSearch.get('upkeepPlanSn')
if (upkeepPlanSn) {
  initSearch.value.quickQryParam = upkeepPlanSn
}

async function handleEdit(row: EquipmentInspectPlanEntity) {
  await AnyDialogHelper.showModel(AddEdit, { data: row })
  handleReloadTable()
}

async function handleProcess(rows: EquipmentInspectPlanEntity[]) {
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.EQ_INSPECT_PLAN,
    processId: rows[0].id,
    queryParams: { id: rows?.map(item => item.id)?.join(',') },
    submitAuditApi: submitEquipmentInspectPlan,
    showCopyTo: true,
  })
  handleReloadTable()
}

function handlePrint() {
  if (!selectedRowKeys.value?.length) {
    message.warning('请先选择一条数据')
    return
  }
  IlisPrintUdr.commonPrint(selectedRowKeys.value as string[], 'EquipmentInspectPlanLedger')
}
</script>
