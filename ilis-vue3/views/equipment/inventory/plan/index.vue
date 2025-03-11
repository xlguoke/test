<template>
  <IlisContainer app-id="inventory_plan">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentInventoryPlanEntity"
        :field-order="['status']"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button
          :icon="h(PlusOutlined)"
          @click="handleEdit(EquipmentInventoryPlanEntity.fromJSON({}))"
        >
          新增
        </a-button>
        <a-button
          :icon="h(ExportOutlined)"
          @click="handleExport('rest/inventory/plan/export')"
        >
          导出
        </a-button>
        <IlisCustomColumns
          type="eq-inventory-plan-list"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentInventoryPlanEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          :custom-row="getCustomRow"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <BaseStatusTag
                :color="EquipmentInventoryPlanStatusDict.getColorByKey(text)"
                :title="getTitle(record as EquipmentInventoryPlanEntity)"
              >
                {{ EquipmentInventoryPlanStatusDict.getLabelByKey(text) }}
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="[EquipmentInventoryPlanStatus.WAIT_APPROVE, EquipmentInventoryPlanStatus.APPROVE_FAIL].includes(record.status)"
                danger
                type="link"
                size="small"
                @click="handleDelete([record] as EquipmentInventoryPlanEntity[])"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentInventoryPlanStatus.WAIT_APPROVE, EquipmentInventoryPlanStatus.APPROVE_FAIL].includes(record.status)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentInventoryPlanEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentInventoryPlanStatus.WAIT_APPROVE, EquipmentInventoryPlanStatus.APPROVE_FAIL].includes(record.status)"
                type="link"
                size="small"
                @click="handleProcess([record] as EquipmentInventoryPlanEntity[])"
              >
                提交
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(AddEdit, { data: EquipmentInventoryPlanEntity.fromJSON(record), isDetail: true })"
              >
                查看
              </a-button>
              <!-- <a-button
                v-if="[EquipmentInventoryPlanStatus.APPROVE_SUCCESS].includes(record.status)"
                type="link"
                size="small"
                @click="handlePrint(record as EquipmentInventoryPlanEntity)"
              >
                打印
              </a-button> -->
              <a-button
                v-if="[EquipmentInventoryPlanStatus.APPROVE_ING].includes(record.status)"
                danger
                type="link"
                size="small"
                @click="handleRevoke(record as EquipmentInventoryPlanEntity)"
              >
                撤回
              </a-button>
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '37' })">
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
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { EquipmentInventoryPlanEntity, EquipmentInventoryPlanStatus, EquipmentInventoryPlanStatusDict } from './EquipmentInventoryPlanEntity'
import { delEquipmentInventoryPlan, getEquipmentInventoryPlanList, revokeEquipmentInventoryPlan, submitEquipmentInventoryPlan } from './api.ts'
import AddEdit from './component/AddEdit.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisCustomColumns, IlisFormSearch, IlisProcessModal, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { ProcessType } from '~/components/commonProcess'
import { BaseStatusTag } from '~/components/UI/index.ts'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  customColumns,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<EquipmentInventoryPlanEntity>({
  api: getEquipmentInventoryPlanList,
  delApi: delEquipmentInventoryPlan,
  customType: 'eq-inventory-plan-list',
})

function getTitle(row: EquipmentInventoryPlanEntity) {
  if (row.status === EquipmentInventoryPlanStatus.APPROVE_ING) {
    return `待${row.nextAuditUserName}审核`
  }
  else if (row.status === EquipmentInventoryPlanStatus.APPROVE_FAIL) {
    return `${row.auditUserName}审核不通过，原因：${row.auditComment}`
  }
}

async function handleEdit(row: EquipmentInventoryPlanEntity) {
  await AnyDialogHelper.showModel(AddEdit, { data: row })
  handleReloadTable()
}

async function handleProcess(rows: EquipmentInventoryPlanEntity[]) {
  await AnyDialogHelper.showModel(IlisProcessModal, {
    processType: ProcessType.EQ_INVENTORY_PLAN,
    processId: rows[0].id,
    queryParams: { id: rows?.map(item => item.id)?.join(',') },
    submitAuditApi: submitEquipmentInventoryPlan,
    submitDataTransfer: (data: any) => {
      return {
        ...data,
        presetAuditors: data.presetAuditers,
      }
    },
  })
  handleReloadTable()
}

// async function handlePrint(row: EquipmentInventoryPlanEntity) {
//   const UDRPrint = new IlisPrintUdr()
//   UDRPrint.commonPrint([row.id], 'EquipmentInventoryPlan')
// }

async function handleRevoke(row: EquipmentInventoryPlanEntity) {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要撤回吗',
    centered: true,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      await revokeEquipmentInventoryPlan(row)
      message.success('撤回成功')
      handleReloadTable()
    },
  })
}
</script>

<style>

</style>
