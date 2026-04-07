<template>
  <IlisContainer app-id="ref_stock_in">
    <div class="h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="InboundRecordEntity"
        @reset="handleReset"
        @search="handleSearch"
      />
      <a-space>
        <a-button v-if="hasPermission('ref_stock_in_add')" type="primary" :icon="h(PlusOutlined)" @click="handleAdd">
          新增入库
        </a-button>
        <a-button v-if="hasPermission('ref_stock_in_print')" :icon="h(PrinterOutlined)" @click="handlePrint">
          打印入库记录表
        </a-button>
        <IlisCustomColumns type="ref_stock_in" @confirm="handleReloadTable()" />
        <a-button v-if="hasPermission('ref_stock_in_export')" :icon="h(ExportOutlined)" @click="handleExport('/ref/stock/in/export')">
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
          :entity="InboundRecordEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="getCustomRow()"
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
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { getInboundRecordList } from './api'
import { useInboundRecord } from './composables/useInboundRecord'
import { InboundRecordEntity } from './entity/InboundRecordEntity'

const { hasPermission } = usePermissionStore()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  lastSearchParams,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleSortChange,
  handleExport,
} = useTableHooks<InboundRecordEntity>({
  customType: 'ref_stock_in',
  api: getInboundRecordList,
  beforeSearch(params) {
    // 格式化page
    params.page = params.page - 1
    if (params.sort === 'productionDate') {
      params.sort = 'material.productionDate'
    }
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
  UDRPrint.commonPrint([], 'RefStockIn', {
    jsonParam: lastSearchParams.value,
  })
}

const {
  actionItems,
  handleAdd,
  setReloadTable,
} = useInboundRecord()

setReloadTable(handleReloadTable)
</script>
