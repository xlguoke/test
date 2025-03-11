<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentAllotEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button @click="handleEdit(EquipmentAllotEntity.fromJSON({}))">
          新增
        </a-button>
        <a-button @click="handlePrint">
          打印
        </a-button>
        <a-button @click="handleExport('rest/eq/allot/controller/export')">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentAllotEntity"
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
                v-if="(record as EquipmentAllotEntity).applyStatus !== EquipmentAllotStatus.APPROVE_ING"
                type="link"
                size="small"
                @click="handleDelete([record] as EquipmentAllotEntity[])"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentAllotStatus.WAIT_APPROVE, EquipmentAllotStatus.APPROVE_REJECT, EquipmentAllotStatus.APPROVE_FAIL].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentAllotEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentAllotStatus.WAIT_APPROVE, EquipmentAllotStatus.APPROVE_REJECT, EquipmentAllotStatus.APPROVE_FAIL].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleProcess(record as EquipmentAllotEntity)"
              >
                提交
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(Detail, EquipmentAllotEntity.fromJSON(record))"
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
import { EquipmentAllotEntity, EquipmentAllotStatus } from './EquipmentAllotEntity'
// import DialogDemo from './DialogDemo.vue'
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
} = useTableHooks<EquipmentAllotEntity>({
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
  UDRPrint.commonPrint(selectedRows.value.map(item => item.id), 'EquipmentAllot')
}

async function handleEdit(row: EquipmentAllotEntity) {
  await AnyDialogHelper.showModel(AddEdit, row)
  handleReloadTable()
}

async function handleProcess(row: EquipmentAllotEntity) {
  await AnyDialogHelper.showModel(Audit, {
    processType: ProcessType.EQ_ALLOT,
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
