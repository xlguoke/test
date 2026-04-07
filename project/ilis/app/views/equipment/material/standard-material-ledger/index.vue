<template>
  <IlisContainer app-id="ref_material">
    <div class="h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="StandardMaterialLedgerEntity"
        :init-data="initQuery"
        @reset="handleReset"
        @search="handleSearch"
      />
      <a-space>
        <a-button v-if="hasPermission('ref_material_add')" type="primary" :icon="h(PlusOutlined)" @click="handleAdd">
          新增
        </a-button>
        <a-button v-if="hasPermission('ref_material_print')" :icon="h(PrinterOutlined)" @click="handlePrint">
          打印标准物质台账
        </a-button>
        <a-button v-if="hasPermission('ref_material_import')" :icon="h(ImportOutlined)" @click="handleImport">
          导入
        </a-button>
        <a-button v-if="hasPermission('ref_material_delete')" :icon="h(DeleteOutlined)" danger @click="handleBatchDelete">
          删除
        </a-button>
        <IlisCustomColumns type="ref_material" @confirm="handleReloadTable()" />
        <a-button v-if="hasPermission('ref_material_export')" :icon="h(ExportOutlined)" @click="handleExport('/ref/material/export')">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          bordered
          :loading="loading"
          :data-source="dataSource"
          :entity="StandardMaterialLedgerEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="getCustomRow()"
          :custom-columns="customColumns"
          :field-order="['priorityWeightDisplay']"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'priorityWeightDisplay'">
              <div class="flex shrink-0">
                <a-tooltip v-if="record.priorityWeight === 2 || record.priorityWeight === 3" title="已过有效期">
                  <a-tag color="red">
                    期
                  </a-tag>
                </a-tooltip>
                <a-tooltip v-if="record.priorityWeight === 1 || record.priorityWeight === 3" title="库存余量预警">
                  <a-tag color="orange">
                    警
                  </a-tag>
                </a-tooltip>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <IlisTableAction :row="record" :options="actionItems" :visible-count="5" />
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang="ts">
import { DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { deleteStandardMaterialLedger, getStandardMaterialLedgerList } from './api'
import ImportModal from './components/ImportModal.vue'
import StandardMaterialLedgerModal from './components/StandardMaterialLedgerModal.vue'
import { useStandardMaterialLedger } from './composables/useStandardMaterialLedger'
import { StandardMaterialLedgerEntity } from './entity/StandardMaterialLedgerEntity'

const UDRPrint = new IlisPrintUdr()

const {
  loading,
  dataSource,
  tableBoxRef,
  customColumns,
  tableHeight,
  selectedRowKeys,
  lastSearchParams,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleSortChange,
  handleExport,
} = useTableHooks<StandardMaterialLedgerEntity>({
  customType: 'ref_material',
  api: getStandardMaterialLedgerList,
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

const { hasPermission } = usePermissionStore()

const {
  actionItems,
  setReloadTable,
} = useStandardMaterialLedger()

setReloadTable(handleReloadTable)

const initQuery = ref<StandardMaterialLedgerEntity>(new StandardMaterialLedgerEntity())

function handleAdd() {
  AnyDialogHelper.showModel(StandardMaterialLedgerModal, {
    mode: 'add',
  }).then(() => {
    handleReloadTable()
  })
}

function handlePrint() {
  UDRPrint.commonPrint([], 'RefMaterial', {
    jsonParam: lastSearchParams.value,
  })
}

function handleBatchDelete() {
  if (!selectedRowKeys.value || selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的记录')
    return
  }
  const keys = selectedRowKeys.value.join(',')
  Modal.confirm({
    title: '批量删除确认',
    content: `确定删除选中的 ${selectedRowKeys.value.length} 条记录吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      loading.value = true
      await deleteStandardMaterialLedger(keys).finally(() => {
        loading.value = false
      })
      message.success('删除成功')
      handleReloadTable()
    },
  })
}

function handleImport() {
  AnyDialogHelper.showModel(ImportModal).then(() => {
    handleReloadTable()
  })
}
</script>
