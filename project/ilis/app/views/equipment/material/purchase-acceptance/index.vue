<template>
  <IlisContainer app-id="ref_purchase_accept">
    <div class="h-full flex flex-col gap-3">
      <!-- 搜索筛选栏 -->
      <IlisFormSearch
        :entity="PurchaseAcceptanceEntity"
        @reset="handleReset"
        @search="handleSearch"
      />

      <!-- 顶部操作栏 -->
      <a-space>
        <a-button v-if="hasPermission('ref_purchase_accept_add')" type="primary" :icon="h(PlusOutlined)" @click="handleAdd">
          新增验收
        </a-button>
        <a-button v-if="hasPermission('ref_purchase_accept_print')" :icon="h(PrinterOutlined)" @click="handlePrintRegister">
          打印购置登记表
        </a-button>
        <IlisCustomColumns type="ref_purchase_accept" @confirm="handleReloadTable()" />
        <a-button v-if="hasPermission('ref_purchase_accept_export')" :icon="h(ExportOutlined)" @click="handleExport('/ref/purchase/accept/export')">
          导出
        </a-button>
      </a-space>

      <!-- 台账列表区 -->
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          bordered
          resizable
          :loading="loading"
          :data-source="dataSource"
          :custom-columns="customColumns"
          :entity="PurchaseAcceptanceEntity"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          :row-selection="getRowSelection()"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <!-- 状态列 -->
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="PurchaseAcceptanceStatusMap[record.status as keyof typeof PurchaseAcceptanceStatusMap].color">
                {{ PurchaseAcceptanceStatusMap[record.status as keyof typeof PurchaseAcceptanceStatusMap].label }}
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'totalAmount'">
              <span>{{ formatAmount(record.totalAmount) }}</span>
            </template>
            <!-- 操作列 -->
            <template v-else-if="column.dataIndex === 'operation'">
              <IlisTableAction :row="record" :options="actionItems" :visible-count="5" />
            </template>
          </template>

          <!-- 展开行：显示标准物质明细 -->
          <template #expandedRowRender="{ record }">
            <a-table
              :columns="detailColumns"
              :data-source="(record.acceptItems as PurchaseAcceptanceDetailEntity[])"
              :pagination="false"
              size="small"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'unitPrice'">
                  <span>{{ formatAmount(record.unitPrice) }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'amount'">
                  <span>{{ formatAmount(record.amount) }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'quantity'">
                  <span>{{ formatAmount(record.quantity) }}</span>
                </template>
              </template>
            </a-table>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang="ts">
import type { PurchaseAcceptanceDetailEntity } from './entity/PurchaseAcceptanceDetailEntity'
import { ExportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { getPurchaseAcceptanceList } from './api'
import PurchaseAcceptanceModal from './components/PurchaseAcceptanceModal.vue'
import { usePurchaseAcceptance } from './composables/usePurchaseAcceptance'
import { PurchaseAcceptanceEntity, PurchaseAcceptanceStatusMap } from './entity/PurchaseAcceptanceEntity'

const UDRPrint = new IlisPrintUdr()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  selectedRows,
  getPagination,
  getCustomRow,
  getRowSelection,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleSortChange,
  handleExport,
} = useTableHooks<PurchaseAcceptanceEntity>({
  customType: 'ref_purchase_accept',
  api: getPurchaseAcceptanceList,
  beforeSearch(params) {
    // 格式化page
    params.page = params.page - 1
    // 格式化sort
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

const { hasPermission } = usePermissionStore()

const {
  actionItems,
  setReloadTable,
} = usePurchaseAcceptance()

setReloadTable(handleReloadTable)

/**
 * 新增验收
 */
function handleAdd() {
  AnyDialogHelper.showModel(PurchaseAcceptanceModal, { mode: 'add' }).then(() => {
    handleReloadTable()
  })
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null)
    return '0.00'
  return amount.toFixed(2)
}

/**
 * 打印购置登记表
 */
function handlePrintRegister() {
  if (!selectedRows.value?.length) {
    message.warning('请先选择一条数据')
    return
  }
  UDRPrint.commonPrint(selectedRows.value.map(item => item.id), 'RefPurchaseAccept')
}

/** 明细表格列定义 */
const detailColumns = [
  { title: '标准物质名称', dataIndex: 'materialName', width: 200 },
  { title: '规格型号', dataIndex: 'materialSpecification', width: 150 },
  { title: '生产厂家', dataIndex: 'manufacturer', width: 150 },
  { title: '购置数量', dataIndex: 'quantity', width: 100 },
  { title: '单价(元)', dataIndex: 'unitPrice', width: 120 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '小计(元)', dataIndex: 'amount', width: 120 },
  { title: '保管人', dataIndex: 'custodian', width: 120 },
  { title: '购置日期', dataIndex: 'purchaseDate', width: 120 },
  { title: '备注', dataIndex: 'remark', width: 200 },
]
</script>
