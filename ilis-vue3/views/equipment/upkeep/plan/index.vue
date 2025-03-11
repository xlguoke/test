<template>
  <IlisContainer app-id="common_eq_upkeep_plan">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentUpkeepPlanEntity"
        :field-order="['status']"
        :init-data="initSearch"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button
          :icon="h(PlusOutlined)"
          @click="handleEdit(EquipmentUpkeepPlanEntity.fromJSON({}))"
        >
          新增
        </a-button>
        <a-button
          :icon="h(ExportOutlined)"
          @click="handleExport('rest/eq/upkeep/plan/export')"
        >
          导出
        </a-button>
        <IlisCustomColumns
          type="upkeepPlan"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentUpkeepPlanEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <BaseStatusTag :color="EquipmentUpkeepPlanStatusDict.getColorByKey(text)">
                {{ EquipmentUpkeepPlanStatusDict.getLabelByKey(text) }}
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="[EquipmentUpkeepPlanStatus.WAIT_APPROVE, EquipmentUpkeepPlanStatus.APPROVE_FAIL].includes(record.status)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentUpkeepPlanEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentUpkeepPlanStatus.APPROVE_ING, EquipmentUpkeepPlanStatus.APPROVE_SUCCESS].includes(record.status)"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(AddEdit, { data: EquipmentUpkeepPlanEntity.fromJSON(record), isDetail: true })"
              >
                查看
              </a-button>
              <a-button
                v-if="[EquipmentUpkeepPlanStatus.WAIT_APPROVE, EquipmentUpkeepPlanStatus.APPROVE_FAIL].includes(record.status)"
                type="link"
                size="small"
                @click="handleProcess([record] as EquipmentUpkeepPlanEntity[])"
              >
                提交审核
              </a-button>
              <a-button
                v-if="[EquipmentUpkeepPlanStatus.WAIT_APPROVE, EquipmentUpkeepPlanStatus.APPROVE_FAIL].includes(record.status)"
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EquipmentUpkeepPlanEntity[], {
                  content: '删除后将无法恢复，您确定要删除当前的设备保养计划吗',
                })"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentUpkeepPlanStatus.APPROVE_ING].includes(record.status)"
                type="link"
                size="small"
                danger
                @click="handleRevoke(record as EquipmentUpkeepPlanEntity)"
              >
                撤回
              </a-button>
              <a-button
                v-if="[EquipmentUpkeepPlanStatus.APPROVE_SUCCESS].includes(record.status)"
                type="link"
                size="small"
                @click="IlisPrintUdr.commonPrint([record.id], 'EquipmentUpkeepPlan')"
              >
                打印
              </a-button>
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '15' })">
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
import { ExclamationCircleOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { EquipmentUpkeepPlanEntity, EquipmentUpkeepPlanStatus, EquipmentUpkeepPlanStatusDict } from './EquipmentUpkeepPlanEntity'
import { delEquipmentUpkeepPlan, getEquipmentUpkeepPlanList, revokeEquipmentUpkeepPlan, submitEquipmentUpkeepPlan } from './api'
import AddEdit from './component/AddEdit.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { IlisContainer, IlisFormSearch, IlisProcessModal, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { ProcessType } from '~/components/commonProcess'

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleReset,
  handleExport,
  handleSearch,
  handleDelete,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<EquipmentUpkeepPlanEntity>({
  api: getEquipmentUpkeepPlanList,
  delApi: delEquipmentUpkeepPlan,
  sizeKey: 'rows',
  customType: 'upkeepPlan',
})

const initSearch = ref(new EquipmentUpkeepPlanEntity())

const urlSearch = new URLSearchParams(window.location.search)
const upkeepPlanSn = urlSearch.get('upkeepPlanSn')
if (upkeepPlanSn) {
  initSearch.value.quickQryParam = upkeepPlanSn
}

async function handleEdit(row: EquipmentUpkeepPlanEntity) {
  await AnyDialogHelper.showModel(AddEdit, { data: row })
  handleReloadTable()
}

async function handleProcess(rows: EquipmentUpkeepPlanEntity[]) {
  await AnyDialogHelper.showModel(IlisProcessModal, {
    processType: ProcessType.EQ_UPKEEP_PLAN,
    processId: rows[0].id,
    queryParams: { id: rows?.map(item => item.id)?.join(',') },
    submitAuditApi: submitEquipmentUpkeepPlan,
  })
  handleReloadTable()
}

async function handleRevoke(row: EquipmentUpkeepPlanEntity) {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要撤回吗',
    centered: true,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      await revokeEquipmentUpkeepPlan(row)
      message.success('撤回成功')
      handleReloadTable()
    },
  })
}
</script>
