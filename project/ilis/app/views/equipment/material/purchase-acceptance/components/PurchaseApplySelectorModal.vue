<template>
  <HtModal
    v-model:open="visible"
    title="从采购申请中选择"
    :width="1400"
    :mask-closable="false"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="onClosed"
  >
    <div class="flex flex-col gap-4 overflow-hidden">
      <IlisFormSearch
        :entity="PurchaseApplyEntity"
        :field-list="['keyword', 'createDate']"
        @search="handleSearch"
      />

      <div class="flex-1 overflow-auto">
        <IlisTable
          row-key="id"
          bordered
          :loading="loading"
          :entity="PurchaseApplyEntity"
          :field-list="PurchaseApplyEntity.getTableFieldList()?.filter(item => !['operation', 'status'].includes(item))"
          :data-source="dataSource"
          :pagination="getPagination()"
          :custom-row="getCustomRow()"
          :scroll="{ x: 1500 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'totalAmount'">
              <span>{{ formatAmount(record.totalAmount) }}</span>
            </template>
          </template>
          <template #expandedRowRender="{ record }">
            <a-table
              :columns="detailColumns"
              :data-source="(record.applyItems as PurchaseApplyDetailEntity[])"
              :pagination="false"
              size="small"
              bordered
              :row-selection="{
                selectedRowKeys: selectedDetailKeys,
                onChange: (keys: (string | number)[], rows: any[]) => handleDetailSelectionChange(keys as string[], rows as PurchaseApplyDetailEntity[], record.id),
              }"
              row-key="id"
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
  </HtModal>
</template>

<script setup lang="ts">
import type { PurchaseApplyDetailEntity } from '../../purchase-apply/entity/PurchaseApplyDetailEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getPurchaseApplyList } from '../../purchase-apply/api'
import { PurchaseApplyEntity } from '../../purchase-apply/entity/PurchaseApplyEntity'
import { getStandardMaterialLedgerDetail } from '../../standard-material-ledger/api'

const props = defineProps<IDialogPropsParam<any, Record<string, any>>>()

const {
  loading,
  dataSource,
  getPagination,
  getCustomRow,
  handleSearch,
} = useTableHooks<PurchaseApplyEntity>({
  api: getPurchaseApplyList,
  payload: {
    isAccepted: 0,
  },
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

const selectedDetailKeys = ref<string[]>([])
const selectedDetailItems = ref<Map<string, any[]>>(new Map())

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

function handleDetailSelectionChange(keys: string[], rows: PurchaseApplyDetailEntity[], parentId: string) {
  selectedDetailKeys.value = keys

  if (rows.length > 0) {
    selectedDetailItems.value.set(parentId, rows)
  }
  else {
    selectedDetailItems.value.delete(parentId)
  }
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null)
    return '0.00'
  return amount.toFixed(2)
}

async function handleOk() {
  const hasDetailSelection = selectedDetailItems.value.size > 0

  if (!hasDetailSelection) {
    message.error('请至少选择一条数据')
    return
  }

  confirmLoading.value = true
  try {
    const selectedItems: any[] = []

    if (hasDetailSelection) {
      const itemsToProcess: any[] = []
      selectedDetailItems.value.forEach((items) => {
        items.forEach((item: any) => {
          itemsToProcess.push(item)
        })
      })

      for (const item of itemsToProcess) {
        let manufacturer = item.manufacturer || ''
        let productionDate = item.productionDate || ''
        let custodian = item.custodian || ''
        let unit = item.unit || ''
        const quantity = item?.quantity

        if (item.materialId) {
          try {
            const { data } = await getStandardMaterialLedgerDetail(item.materialId)
            if (data) {
              manufacturer = manufacturer || data.manufacturer || ''
              productionDate = productionDate || data.productionDate || ''
              custodian = custodian || data.custodian || ''
              unit = unit || data.unit || ''
            }
          }
          catch (e) {
            console.error('获取标准物质详情失败:', e)
          }
        }

        selectedItems.push({
          applyItemId: item.id,
          materialId: item.materialId,
          materialName: item.materialName,
          materialSpecification: item.materialSpecification,
          manufacturer,
          productionDate,
          unitPrice: item.unitPrice,
          unit,
          quantity,
          custodian,
          purchaseDate: dayjs().format('YYYY-MM-DD'),
          isCustomMaterial: false,
          isCustomSpecification: false,
        })
      }

      props.onConfirm([...selectedItems])
      visible.value = false
    }
  }
  catch (error) {
    console.error('处理选择失败:', error)
    message.error('处理选择失败')
  }
  finally {
    confirmLoading.value = false
  }
}
</script>

<style scoped>
</style>
