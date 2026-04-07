<template>
  <IlisContainer app-id="ref_stock_out">
    <div class="h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="OutboundRecordEntity"
        @reset="handleReset"
        @search="handleSearch"
      />
      <a-space>
        <a-button v-if="hasPermission('ref_stock_out_add')" type="primary" :icon="h(PlusOutlined)" @click="handleAdd">
          新增出库
        </a-button>
        <a-button v-if="hasPermission('ref_stock_out_print')" :icon="h(PrinterOutlined)" @click="handlePrint">
          打印出库记录表
        </a-button>
        <IlisCustomColumns type="ref_stock_out" @confirm="handleReloadTable()" />
        <a-button v-if="hasPermission('ref_stock_out_export')" :icon="h(ExportOutlined)" @click="handleExport('/ref/stock/out/export')">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          bordered
          resizable
          :loading="loading"
          :data-source="dataSource"
          :custom-columns="customColumns"
          :entity="OutboundRecordEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :custom-row="getCustomRow()"
          :row-selection="getRowSelection()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <IlisTableAction :row="record" :options="actionItems" :visible-count="5" />
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang="ts">
import { ExportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { getOutboundRecordList } from './api'
import OutboundRecordModal from './components/OutboundRecordModal.vue'
import { useOutboundRecord } from './composables/useOutboundRecord'
import { OutboundRecordEntity } from './entity/OutboundRecordEntity'

const { hasPermission } = usePermissionStore()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  lastSearchParams,
  getPagination,
  getCustomRow,
  getRowSelection,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleSortChange,
  handleExport,
} = useTableHooks<OutboundRecordEntity>({
  customType: 'ref_stock_out',
  api: getOutboundRecordList,
  beforeSearch(params) {
    // 格式化sort
    params.page = params.page - 1
    const formattedParams = params.sort
      ? {
          ...params,
          sort: `${params.sort},${params.order}`,
        }
      : params
    delete formattedParams.order
    delete formattedParams.orderBy
    return formattedParams
  },
  responseDataTransform(data) {
    return {
      rows: data.content || [],
      total: data.totalElements || 0,
    }
  },
  pageKey: 'page',
  sizeKey: 'size',
})

function handlePrint() {
  const UDRPrint = new IlisPrintUdr()
  UDRPrint.commonPrint([], 'RefStockOut', {
    jsonParam: lastSearchParams.value,
  })
}

const {
  actionItems,
  setReloadTable,
} = useOutboundRecord()

setReloadTable(handleReloadTable)

function handleAdd() {
  AnyDialogHelper.showModel(OutboundRecordModal, {
    mode: 'add',
  }).then(() => {
    handleReloadTable()
  })
}
</script>
