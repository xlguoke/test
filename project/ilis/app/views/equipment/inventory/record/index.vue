<template>
  <IlisContainer app-id="inventory_record">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentInventoryRecordEntity"
        :field-order="['status', 'queryCode']"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-dropdown>
          <a-button
            :icon="h(PlusOutlined)"
          >
            新增
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="handleAddByPlan()">
                按盘点计划新增
              </a-menu-item>
              <a-menu-item @click="handleAddByDevice(EquipmentInventoryRecordEntity.fromJSON({}))">
                新建盘点
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button
          :icon="h(ExportOutlined)"
          @click="handleExport('rest/eq/inventory/export')"
        >
          导出
        </a-button>
        <IlisCustomColumns
          type="eq-inventory-list"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentInventoryRecordEntity"
          :table-height="tableHeight"
          :custom-columns="customColumns"
          :custom-row="getCustomRow()"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <BaseStatusTag
                :color="EquipmentInventoryRecordStatusDict.getColorByKey(text)"
                :title="getTitle(record as EquipmentInventoryRecordEntity)"
              >
                {{ EquipmentInventoryRecordStatusDict.getLabelByKey(text) }}
              </BaseStatusTag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="[EquipmentInventoryRecordStatus.WAIT_APPROVE, EquipmentInventoryRecordStatus.APPROVE_FAIL, EquipmentInventoryRecordStatus.UNDER_WAY].includes(record.status)"
                danger
                type="link"
                size="small"
                @click="handleDelete([record] as EquipmentInventoryRecordEntity[])"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentInventoryRecordStatus.WAIT_APPROVE, EquipmentInventoryRecordStatus.APPROVE_FAIL, EquipmentInventoryRecordStatus.UNDER_WAY].includes(record.status)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentInventoryRecordEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentInventoryRecordStatus.WAIT_APPROVE, EquipmentInventoryRecordStatus.APPROVE_FAIL, EquipmentInventoryRecordStatus.UNDER_WAY].includes(record.status)"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(MakeInventory, { data: EquipmentInventoryRecordEntity.fromJSON(record) }).then(() => { handleReloadTable() })"
              >
                登记
              </a-button>
              <a-button
                v-if="[EquipmentInventoryRecordStatus.WAIT_APPROVE, EquipmentInventoryRecordStatus.APPROVE_FAIL].includes(record.status)"
                type="link"
                size="small"
                @click="handleProcess([record] as EquipmentInventoryRecordEntity[])"
              >
                提交
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(MakeInventory, { data: EquipmentInventoryRecordEntity.fromJSON(record), isDetail: true })"
              >
                查看
              </a-button>
              <!-- <a-button
                type="link"
                size="small"
                @click="handlePrint(record as EquipmentInventoryRecordEntity)"
              >
                打印
              </a-button> -->
              <a-button
                v-if="[EquipmentInventoryRecordStatus.APPROVE_ING].includes(record.status)"
                danger
                type="link"
                size="small"
                @click="handleRevoke(record as EquipmentInventoryRecordEntity)"
              >
                撤回
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '38' })"
              >
                日志
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleExportCheckIn(record.id)"
              >
                导出
              </a-button>
              <a-button v-permission="'inventory_print'" type="link" size="small" @click="handlePrint(record as EquipmentInventoryRecordEntity)">
                打印
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { EquipmentInventoryPlanEntity } from '../plan/EquipmentInventoryPlanEntity'
import { ExclamationCircleOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { DeviceEntity } from '../../DeviceEntity'
import { getEquipmentInventoryPlanEqDetail } from '../plan/api'
import { delEquipmentInventoryRecord, getEquipmentInventoryRecordList, revokeEquipmentInventoryRecord, submitEquipmentInventoryRecord } from './api'

import AddByDevice from './component/AddByDevice.vue'
import AddByPlan from './component/AddByPlan.vue'
import Edit from './component/Edit.vue'
import MakeInventory from './component/MakeInventory.vue'
import { EquipmentInventoryPlanType, EquipmentInventoryRecordEntity, EquipmentInventoryRecordStatus, EquipmentInventoryRecordStatusDict } from './EquipmentInventoryRecordEntity'

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<EquipmentInventoryRecordEntity>({
  api: getEquipmentInventoryRecordList,
  delApi: delEquipmentInventoryRecord,
  customType: 'eq-inventory-list',
})

const ilisPrintUdr = new IlisPrintUdr()
async function handlePrint(record: EquipmentInventoryRecordEntity) {
  ilisPrintUdr.commonPrint([record.id], PrintUdrTempleteType.设备盘点记录打印)
}
async function handleEdit(row: EquipmentInventoryRecordEntity) {
  await AnyDialogHelper.showModel(Edit, { data: row })
  handleReloadTable()
}

async function handleAddByPlan() {
  const res = await AnyDialogHelper.showModel(AddByPlan) as EquipmentInventoryPlanEntity
  const { data } = await getEquipmentInventoryPlanEqDetail(res)
  await AnyDialogHelper.showModel(AddByDevice, {
    data: EquipmentInventoryRecordEntity.fromJSON({
      inventoryType: EquipmentInventoryPlanType.PLAN,
      inventorySn: res.inventorySn,
      inventoryName: res.inventoryName,
    }),
    initDevice: DeviceEntity.fromJsonArray(data),
  })
  handleReloadTable()
}

async function handleAddByDevice(row: EquipmentInventoryRecordEntity) {
  row.inventoryType = EquipmentInventoryPlanType.CREATE
  await AnyDialogHelper.showModel(AddByDevice, { data: row })
  handleReloadTable()
}

async function handleProcess(rows: EquipmentInventoryRecordEntity[]) {
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.EQ_INVENTORY_RECORD,
    processId: rows[0].id,
    queryParams: { id: rows?.map(item => item.id)?.join(',') },
    submitAuditApi: submitEquipmentInventoryRecord,
    submitDataTransfer: (data) => {
      data.presetAuditors = data.presetAuditers
      delete data.presetAuditers
      return data
    },
  })
  handleReloadTable()
}

// async function handlePrint(row: EquipmentInventoryRecordEntity) {
//   const UDRPrint = new IlisPrintUdr()
//   UDRPrint.commonPrint([row.id], 'EquipmentInventoryRecord')
// }

async function handleRevoke(row: EquipmentInventoryRecordEntity) {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确认要撤回吗',
    centered: true,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      await revokeEquipmentInventoryRecord(row)
      message.success('撤回成功')
      handleReloadTable()
    },
  })
}

function getTitle(row: EquipmentInventoryRecordEntity) {
  if (row.status === EquipmentInventoryRecordStatus.APPROVE_ING) {
    return `待${row.nextAuditUserName}审核`
  }
  else if (row.status === EquipmentInventoryRecordStatus.APPROVE_FAIL) {
    return `${row.auditUserName}审核不通过，原因：${row.auditComment}`
  }
}

function handleExportCheckIn(inventoryId: string) {
  window.open(`${import.meta.env.VITE_ILIS_BASE}/rest/eq/inventory/detail/export?inventoryId=${inventoryId}`)
}
</script>
