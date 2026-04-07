<template>
  <div class=" h-full flex flex-col gap-3">
    <IlisFormSearch
      :entity="WaitAuditReportEntity"
      :field-list="['applicationType', 'applicationDateSearch', 'q']"
      @reset="handleReset"
      @search="handleSearch"
    >
    </IlisFormSearch>
    <a-space>
      <a-button
        v-permission="'report::business::audit'"
        class="flex items-center"
        :icon="h(AuditOutlined)"
        @click="handleBatchAudit"
      >
        批量审核
      </a-button>
      <!-- todo列筛选 -->
      <IlisCustomColumns
        type="report_business_application_under"
        @confirm="handleReloadTable()"
      ></IlisCustomColumns>
      <a-button :icon="h(ExportOutlined)" @click="handleExport('rest/report/business/application/export')">
        导出
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :loading="loading"
        :data-source="dataSource"
        :entity="WaitAuditReportEntity"
        :table-height="tableHeight"
        :custom-row="getCustomRow()"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button
              v-permission="'report::business::detail'"
              type="link"
              @click.stop="AnyDialogHelper.showModel(Detail, { data: record, isAudit: false, type: 'detail' })"
            >
              详情
            </a-button>
            <a-button
              v-permission="'report::business::audit'"
              type="link"
              @click.stop="AnyDialogHelper.showModel(Audit, [record]).then(() => getList())"
            >
              审核
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { AuditOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getReportBusinessList } from '../api'
import { WaitAuditReportEntity } from '../ReportBusinessEntity'
import Audit from './Audit.vue'
import Detail from './Detail.vue'

const { tableHeight, tableBoxRef } = useTableHeight()

const {
  loading,
  dataSource,
  customColumns,
  selectedRows,
  getList,
  getRowSelection,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
  handleExport,
  handleReloadTable,
} = useTableHooks<WaitAuditReportEntity>({
  customType: 'report_business_application_under',
  api: getReportBusinessList,
  payload: {
    underAudited: true,
  },
})
async function handleBatchAudit() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择申请！')
  }
  await AnyDialogHelper.showModel(Audit, selectedRows.value)
  getList()
}
</script>

  <style>

  </style>
