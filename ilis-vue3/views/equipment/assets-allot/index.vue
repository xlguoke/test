<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentAssetAllotEntity"
        :field-order="['quickQryParam', 'type', 'commonDate']"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button @click="handleEdit(EquipmentAssetAllotEntity.fromJSON({}))">
          新增
        </a-button>
        <a-button @click="handlePrint">
          打印
        </a-button>
        <a-button @click="handleExport('rest/equipment/assets-allot/export')">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentAssetAllotEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: 'radio',
          })"
          :custom-row="getCustomRow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="(record as EquipmentAssetAllotEntity).applyStatus !== EquipmentAssetAllotStatus.APPROVE_ING"
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EquipmentAssetAllotEntity[])"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentAssetAllotStatus.WAIT_APPROVE, EquipmentAssetAllotStatus.APPROVE_REJECT, EquipmentAssetAllotStatus.APPROVE_FAIL].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentAssetAllotEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentAssetAllotStatus.WAIT_APPROVE, EquipmentAssetAllotStatus.APPROVE_REJECT, EquipmentAssetAllotStatus.APPROVE_FAIL].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleProcess(record as EquipmentAssetAllotEntity)"
              >
                提交
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(Detail, EquipmentAssetAllotEntity.fromJSON(record))"
              >
                详情
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(LogModalByApi, {
                  id: record.id,
                  logType: '18',
                })"
              >
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
import { EquipmentAssetAllotEntity, EquipmentAssetAllotStatus } from './EquipmentAssetAllotEntity'
import { delEquipmentAllot, getEquipmentAllotList, submitEquipmentAllot } from './api'
import AddEdit from './component/AddEdit.vue'
import Audit from './component/Audit.vue'
import Detail from './component/Detail.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { ProcessType } from '~/components/commonProcess'

const {
  loading,
  dataSource,
  selectedRows,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
} = useTableHooks<EquipmentAssetAllotEntity>({
  api: getEquipmentAllotList,
  delApi: delEquipmentAllot,
  sizeKey: 'rows',
})

async function handlePrint() {
  if (!selectedRows.value?.length) {
    message.warning('请先选择一条数据')
    return
  }
  const UDRPrint = new IlisPrintUdr()
  UDRPrint.commonPrint(selectedRows.value.map(item => item.id), 'AssetAllot')
}

async function handleEdit(row: EquipmentAssetAllotEntity) {
  await AnyDialogHelper.showModel(AddEdit, row)
  handleReloadTable()
}

async function handleProcess(row: EquipmentAssetAllotEntity) {
  await AnyDialogHelper.showModel(Audit, {
    processType: ProcessType.ASSET_ALLOT,
    processId: row.id,
    queryParams: { id: row.id },
    submitAuditApi: submitEquipmentAllot,
    rentType: row.rentType,
  })
  handleReloadTable()
}
</script>

<style>

</style>
