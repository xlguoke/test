<template>
  <div class=" h-full flex flex-col gap-3">
    <IlisFormSearch
      :entity="ReportAuditEntity"
      @reset="handleReset"
      @search="handleSearch"
    >
    </IlisFormSearch>
    <a-space>
      <!-- todo列筛选 -->
      <IlisCustomColumns
        type="report_business_application_over"
        @confirm="handleReloadTable()"
      ></IlisCustomColumns>
      <a-button :icon="h(ExportOutlined)" @click="handleExport('rest/report/business/application/export')">
        导出
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :entity="ReportAuditEntity"
        :table-height="tableHeight"
        :custom-columns="customColumns"
        :custom-row="getCustomRow()"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button
              v-permission="'report::business::detail'"
              type="link"
              @click.stop="AnyDialogHelper.showModel(Detail, { data: record, isAudit: true })"
            >
              详情
            </a-button>
          </template>
          <template v-if="column.dataIndex === 'auditPass'">
            <a-tag :color="AUDIT_PASS_DICT.getColorByKey(text)">
              {{ AUDIT_PASS_DICT.getLabelByKey(text) }}
            </a-tag>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ExportOutlined } from '@ant-design/icons-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getReportBusinessList } from '../api'
import { AUDIT_PASS_DICT, ReportAuditEntity } from '../ReportBusinessEntity'
import Detail from './Detail.vue'

const { tableHeight, tableBoxRef } = useTableHeight()

const {
  loading,
  dataSource,
  customColumns,
  getRowSelection,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
  handleExport,
  handleReloadTable,
} = useTableHooks<ReportAuditEntity>({
  customType: 'report_business_application_over',
  api: getReportBusinessList,
  sizeKey: 'rows',
  payload: {
    underAudited: false,
  },
})
</script>

  <style>

  </style>
