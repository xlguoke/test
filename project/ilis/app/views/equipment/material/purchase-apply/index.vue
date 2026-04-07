<template>
  <IlisContainer app-id="ref_purchase_apply">
    <div class="h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="PurchaseApplyEntity"
        @reset="handleReset"
        @search="handleSearch"
      />
      <a-space>
        <a-button v-if="hasPermission('ref_purchase_apply_add')" type="primary" :icon="h(PlusOutlined)" @click="handleAdd">
          新增申请
        </a-button>
        <IlisCustomColumns type="ref_purchase_apply" @confirm="handleReloadTable()" />
        <a-button v-if="hasPermission('ref_purchase_apply_export')" :icon="h(ExportOutlined)" @click="handleExport('/ref/purchase/apply/export')">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          bordered
          :loading="loading"
          :data-source="dataSource"
          :custom-columns="customColumns"
          :entity="PurchaseApplyEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="PurchaseApplyStatusMap[record.status as keyof typeof PurchaseApplyStatusMap].color">
                {{ PurchaseApplyStatusMap[record.status as keyof typeof PurchaseApplyStatusMap].label }}
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'totalAmount'">
              <span>{{ formatAmount(record.totalAmount) }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <IlisTableAction :row="record" :options="actionItems" :visible-count="5" />
            </template>
          </template>
          <template #expandedRowRender="{ record }">
            <a-table
              :columns="detailColumns"
              :data-source="record.applyItems"
              :pagination="false"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'unitPrice'">
                  <span>{{ formatAmount(record.unitPrice) }}</span>
                </template>
                <template v-if="column.dataIndex === 'amount'">
                  <span>{{ formatAmount(record.amount) }}</span>
                </template>
                <template v-if="column.dataIndex === 'quantity'">
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
import { ExportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { getPurchaseApplyList } from './api'
import PurchaseApplyModal from './components/PurchaseApplyModal.vue'
import { usePurchaseApply } from './composables/usePurchaseApply'
import { PurchaseApplyEntity, PurchaseApplyStatusMap } from './entity/PurchaseApplyEntity'

const { hasPermission } = usePermissionStore()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleSortChange,
  handleExport,
} = useTableHooks<PurchaseApplyEntity>({
  customType: 'ref_purchase_apply',
  api: getPurchaseApplyList,
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

const {
  actionItems,
  setReloadTable,
} = usePurchaseApply()

setReloadTable(handleReloadTable)

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null)
    return '0.00'
  return amount.toFixed(2)
}

function handleAdd() {
  AnyDialogHelper.showModel(PurchaseApplyModal, { mode: 'add' }).then(() => {
    handleReloadTable()
  })
}

const detailColumns = [
  { title: '标准物质名称', dataIndex: 'materialName', width: 200 },
  { title: '规格型号', dataIndex: 'materialSpecification', width: 150 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
  { title: '单价(元)', dataIndex: 'unitPrice', width: 120 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '小计(元)', dataIndex: 'amount', width: 120 },
  { title: '保管人', dataIndex: 'custodian', width: 120 },
  { title: '备注', dataIndex: 'remark', width: 200 },
]
</script>
