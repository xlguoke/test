<template>
  <IlisContainer app-id="common_eq_use_record">
    <BaseSpinWrapper>
      <IlisFormSearch
        ref="formSearchRef"
        :entity="EquipmentUsageRecordDetailEntity"
        :init-data="queryForm"
        @reset="customReset"
        @search="customSearch"
      />
      <a-flex justify="space-between" align="center">
        <div class="flex gap-2">
          <a-button v-permission="'eqDetailUseRecord::add'" type="primary" @click="onAdd">
            新增
          </a-button>
          <a-button v-permission="'eqDetailUseRecord::delete'" danger @click="onBatchDelete">
            删除
          </a-button>
          <a-button v-permission="'eqDetailUseRecord::print'" @click="handlePrint">
            打印
          </a-button>
          <IlisCustomColumns
            type="EqDetailUseRecordList"
            @confirm="handleReloadTable()"
          ></IlisCustomColumns>
        </div>
        <a-checkbox v-model:checked="notBindTask" class="float-right" @change="changeBindTask">
          无关联任务
        </a-checkbox>
      </a-flex>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentUsageRecordDetailEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :custom-row="getCustomRow()"
          :row-selection="getRowSelection()"
          :custom-columns="customColumns"
          :scroll="{
            x: 1500,
          }"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'startUseTime'">
              <span v-if="record.startUseTime && record.endUseTime">
                {{ record.startUseTime }} ~ {{ record.endUseTime }}
              </span>
            </template>
            <template v-else-if="column.dataIndex === 'eqNextCheckDate'">
              {{ record.eqNextCheckDate ? dayjs(record.eqNextCheckDate).format('YYYY-MM-DD') : '' }}
            </template>
            <template v-else-if="column.dataIndex === 'Action'">
              <a-button v-permission="'eqDetailUseRecord::edit'" type="link" @click="onEdit(record)">
                编辑
              </a-button>
              <a-button v-permission="'eqDetailUseRecord::delete'" type="link" danger @click="onDelete(record)">
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { EquipmentUsageRecordEntity } from '../EquipmentUsageRecordEntity'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import EqUseRecordAddModal from '~/views/equipment/usage-record/components/EqUseRecordAddModal.vue'
import { deleteEqUseRecord, getEqUseRecordList } from '../api'
import { EquipmentUsageRecordDetailEntity } from '../EquipmentUsageRecordDetailEntity'

const formSearchRef = ref()

const { equipmentId, equipmentSn } = useUrlSearchParams()

const queryForm = ref(new EquipmentUsageRecordDetailEntity())

queryForm.value.useEquipmentDate = [
  dayjs().year(new Date().getFullYear() - 1).date(new Date().getDate() + 1).format(EDateFormatType.YYYY_MM_DD),
  dayjs().format(EDateFormatType.YYYY_MM_DD),
]

const notBindTask = ref(false)

const {
  loading,
  dataSource,
  lastSearchParams,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  getCustomRow,
  getRowSelection,
  handleSortChange,
  handleReloadTable,
  selectedRows,
  selectedRowKeys,
  handleSearch,
  handleReset,
} = useTableHooks<EquipmentUsageRecordDetailEntity>({
  customType: 'EqDetailUseRecordList',
  api: getEqUseRecordList,
  totalKey: 'count',
  immediate: false,
})

function getFormatQuery(q) {
  const query = { ...q }

  query.notBindTask = notBindTask.value
  query.dateType = 'USE'
  query.equipmentCode = equipmentSn || ''

  if (
    query.nextCheckDate
    && query.nextCheckDate[0]
    && query.nextCheckDate[1]
  ) {
    query.nextCheckDateStart = dayjs(query.nextCheckDate[0]).format(EDateFormatType.YYYY_MM_DD)
    query.nextCheckDateEnd = dayjs(query.nextCheckDate[1]).format(EDateFormatType.YYYY_MM_DD)
  }
  else {
    query.nextCheckDateStart = query.nextCheckDateEnd = ''
  }

  if (
    query.useEquipmentDate
    && query.useEquipmentDate[0]
    && query.useEquipmentDate[1]
  ) {
    query.stamp = `${dayjs(query.useEquipmentDate[0]).valueOf()},${dayjs(query.useEquipmentDate[1]).valueOf()}`
  }
  else {
    query.stamp = undefined
  }

  if (
    query.consignDate
    && query.consignDate[0]
    && query.consignDate[1]
  ) {
    query.consignDateStart = dayjs(query.consignDate[0]).format(EDateFormatType.YYYY_MM_DD)
    query.consignDateEnd = dayjs(query.consignDate[1]).format(EDateFormatType.YYYY_MM_DD)
  }
  else {
    query.consignDateStart = query.consignDateEnd = undefined
  }

  delete query.nextCheckDate
  delete query.useEquipmentDate
  delete query.consignDate

  return query
}

function customReset() {
  handleReset({
    notBindTask,
    dateType: 'USE',
    equipmentCode: equipmentSn || '',
  })
}

// 查询
function customSearch(query: any) {
  handleSearch(getFormatQuery(query))
}

// 切换是否关联任务
function changeBindTask() {
  const query = formSearchRef.value.formState
  handleSearch(getFormatQuery(query))
}

async function handlePrint() {
  if (dataSource.value.length === 0) {
    message.warning('当前无数据可打印')
    return
  }
  IlisPrintUdr.commonPrint([], 'SingleEquipmentUseRecord', {
    jsonParam: lastSearchParams.value,
  })
}

function onAdd() {
  AnyDialogHelper.showModel(EqUseRecordAddModal, {
    equipmentId,
  }).then(() => {
    handleReloadTable()
  })
}

function onEdit(record: EquipmentUsageRecordEntity) {
  AnyDialogHelper.showModel(EqUseRecordAddModal, {
    record,
  }).then(() => {
    handleReloadTable()
  })
}

function onDelete(record: EquipmentUsageRecordEntity) {
  Modal.confirm({
    title: '您正在删除设备使用记录！',
    content: '删除后无法恢复，且会同步删除关联任务中对应参数的设备使用数据，若已转换报告文件，可能需要您重新转换更新，您确定要删除吗？',
    onOk: async () => {
      await deleteEqUseRecord(record.id)
      handleReloadTable()
      message.success('删除成功！')
    },
  })
}

function onBatchDelete() {
  if (!selectedRowKeys.value.length) {
    message.warning('请勾选要删除的数据！')
    return
  }

  Modal.confirm({
    title: '您正在删除设备使用记录！',
    content: '删除后无法恢复，且会同步删除关联任务中对应参数的设备使用数据，若已转换报告文件，可能需要您重新转换更新，您确定要删除吗？',
    onOk: async () => {
      for (let i = 0; i < selectedRowKeys.value.length; i++) {
        await deleteEqUseRecord(selectedRowKeys.value[i])
      }
      handleReloadTable()
      selectedRowKeys.value = []
      selectedRows.value = []
    },
  })
}
</script>
