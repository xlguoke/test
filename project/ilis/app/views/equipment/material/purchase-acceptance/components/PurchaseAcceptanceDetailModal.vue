<template>
  <HtModal
    v-model:open="visible"
    title="购置验收详情"
    :width="1600"
    :mask-closable="false"
    :hide-confirm="true"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="purchase" tab="购置登记" />
        <a-tab-pane key="acceptance" tab="验收登记" />
      </a-tabs>

      <!-- 购置登记 Tab -->
      <div v-show="activeTab === 'purchase'">
        <div class="mb-3 flex justify-between items-center">
          <a-form layout="inline">
            <a-form-item label="验收人">
              <a-input v-model:value="purchaseData.accepter" disabled style="width: 200px" />
            </a-form-item>
          </a-form>
        </div>

        <IlisTable
          row-key="id"
          bordered
          size="small"
          :entity="PurchaseAcceptanceDetailEntity"
          :data-source="purchaseData.acceptItems"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'amount'">
              <span>{{ formatAmount(record.amount) }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'unitPrice'">
              <span>{{ formatAmount(record.unitPrice) }}</span>
            </template>
          </template>
        </IlisTable>

        <div class="mt-3 flex justify-end gap-6 text-gray-600">
          <span>标准物质种数：{{ purchaseData.acceptItems?.length || 0 }}</span>
          <span>总金额：{{ formatAmount(calculateTotalAmount()) }} 元</span>
        </div>
      </div>

      <!-- 验收登记 Tab -->
      <div v-show="activeTab === 'acceptance'">
        <div class="mt-3">
          <BaseTitle>验收登记</BaseTitle>
          <IlisTable
            row-key="id"
            bordered
            size="small"
            :entity="PurchaseAcceptanceAcceptanceEntity"
            :data-source="acceptanceData.acceptanceItems"
            :pagination="false"
            :table-width="700"
          />
        </div>

        <div class="mt-3">
          <BaseTitle>验收结果</BaseTitle>
          <a-form :label-col="{ span: '120px' }" :wrapper-col="{ flex: '1' }">
            <a-form-item label="验收结论">
              <a-textarea
                v-model:value="acceptanceData.conclusion"
                disabled
                :rows="3"
                :max-length="500"
              />
            </a-form-item>

            <a-form-item label="验收日期">
              <a-input v-model:value="acceptanceData.acceptDate" disabled style="width: 200px" />
            </a-form-item>

            <a-form-item>
              <a-checkbox v-model:checked="acceptanceData.isAutoStockIn" disabled>
                验收通过后自动入库
              </a-checkbox>
            </a-form-item>

            <a-form-item label="附件">
              <HtUploadFile
                v-if="purchaseData.id"
                :business-id="purchaseData.id"
                :business-type="BUSINES_TYPE.REF_PURCHASE_ACCEPT_REGISTER"
                :is-reandonly="true"
              />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-spin>

    <template #footer>
      <div class="flex justify-end">
        <a-button @click="handleCancel">
          关闭
        </a-button>
      </div>
    </template>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'

import { getPurchaseAcceptanceDetail } from '../api'
import { PurchaseAcceptanceAcceptanceEntity } from '../entity/PurchaseAcceptanceAcceptanceEntity'
import { PurchaseAcceptanceDetailEntity } from '../entity/PurchaseAcceptanceDetailEntity'

const props = defineProps<IDialogPropsParam<null, { mode: 'detail', id: string }>>()

const visible = ref(true)
const loading = ref(false)
const activeTab = ref('purchase')

const purchaseData = reactive({
  id: '',
  accepter: '',
  accepterId: '',
  acceptItems: [] as any[],
})

const acceptanceData = reactive({
  acceptanceItems: [] as any[],
  conclusion: '',
  acceptDate: '',
  isAutoStockIn: true,
})

async function loadDetail() {
  if (!props.param.id)
    return

  loading.value = true
  try {
    const { data } = await getPurchaseAcceptanceDetail(props.param.id)
    if (data) {
      purchaseData.id = data.id
      purchaseData.accepter = data.accepter || ''
      purchaseData.accepterId = data.accepterId || ''
      purchaseData.acceptItems = (data.acceptItems || []).map((item: any, index: number) => ({
        ...item,
        id: item.id || `purchase-${index}`,
      }))

      acceptanceData.acceptanceItems = (data.acceptItems || []).map((item: any, index: number) => ({
        id: item.id || `acceptance-${index}`,
        materialName: item.materialName,
        materialSpecification: item.materialSpecification,
        actualQuantity: item.actualQuantity || item.quantity,
        unit: item.unit,
        acceptResult: item.acceptResult,
      }))
      acceptanceData.conclusion = data.conclusion || ''
      acceptanceData.acceptDate = data.acceptDate || ''
      acceptanceData.isAutoStockIn = data.isAutoStockIn
    }
  }
  catch (error) {
    console.error('加载详情失败:', error)
  }
  finally {
    loading.value = false
  }
}

function handleCancel() {
  visible.value = false
}

function calculateTotalAmount(): number {
  return purchaseData.acceptItems.reduce((sum, item) => sum + (item.amount || 0), 0)
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null)
    return '0.00'
  return amount.toFixed(2)
}

onMounted(() => {
  loadDetail()
})
</script>
