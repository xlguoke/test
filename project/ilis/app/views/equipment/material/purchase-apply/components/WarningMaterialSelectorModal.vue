<template>
  <HtModal
    v-model:open="visible"
    title="从余量预警中新增"
    :width="1200"
    :mask-closable="false"
    :confirm-loading="confirmLoading"
    :hide-confirm="false"
    :after-close="onClosed"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="flex flex-col gap-4">
      <!-- 搜索表单 -->
      <IlisFormSearch
        :entity="StandardMaterialLedgerEntity"
        :field-list="['keyword']"
        @search="handleSearch"
        @reset="handleReset"
      />

      <!-- 标准物质表格 -->
      <IlisTable
        :loading="loading"
        row-key="id"
        resizable
        bordered
        :entity="StandardMaterialLedgerEntity"
        :field-list="tableColumns"
        :custom-row="getCustomRow()"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :data-source="dataSource"
      />
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getStandardMaterialLedgerList } from '../../standard-material-ledger/api'
import { StandardMaterialLedgerEntity } from '../../standard-material-ledger/entity/StandardMaterialLedgerEntity'

defineProps<IDialogPropsParam<null, { mode: 'add' | 'edit' | 'detail', id?: string }>>()

const emit = defineEmits(['confirm', 'cancel'])

// 表格相关
const {
  loading,
  dataSource,
  selectedRows,
  getPagination,
  getCustomRow,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<StandardMaterialLedgerEntity>({
  api: getStandardMaterialLedgerList,
  beforeSearch(params) {
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
  payload: {
    isWarning: true,
  },
  responseDataTransform(data) {
    return {
      rows: data.content || [],
      total: data.totalElements || 0,
    }
  },
  pageKey: 'pageNumber',
  sizeKey: 'pageSize',
})

const visible = ref(true)
const confirmLoading = ref(false)

// 表格列配置
const tableColumns = computed(() => [
  'name', // 标准物质名称
  'specification', // 规格型号
  'inventoryQuantity', // 库存
  'thresholdValue', // 预警阈值
  'custodian', // 保管人
])

// 选中的行
async function handleOk() {
  if (selectedRows.value.length === 0) {
    message.warning('请至少选择一种标准物质')
    return
  }

  confirmLoading.value = true
  try {
    // 准备选中的数据
    const selectedMaterials = selectedRows.value.map(row => ({
      materialId: row.id,
      materialName: row.name,
      materialSpecification: row.specification,
      unitPrice: row.unitPrice,
      unit: row.unit,
      custodian: row.custodian,
      isCustomMaterial: false, // 非自定义，会影响部分交互
    }))

    emit('confirm', selectedMaterials)
    visible.value = false
  }
  catch (error) {
    console.error('处理选择失败:', error)
    message.error('处理选择失败')
  }
  finally {
    confirmLoading.value = false
  }
}

function handleCancel() {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped>
/* 自定义样式 */
</style>
