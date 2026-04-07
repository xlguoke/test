<template>
  <HtModal
    v-model:open="visible"
    title="详情"
    :width="1200"
    :hide-confirm="true"
    :after-close="onClosed"
  >
    <a-spin :spinning="loading">
      <div class="flex flex-col gap-3">
        <!-- 标准物质列表 -->
        <div>
          <BaseTitle>标准物质列表</BaseTitle>
          <IlisTable
            row-key="id"
            bordered
            size="small"
            :field-list="fieldList"
            :entity="PurchaseApplyDetailEntity"
            :data-source="dataSource"
            :pagination="false"
            :table-width="1000"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'amount'">
                <span>{{ formatSubtotal(record as PurchaseApplyDetailEntity) }}</span>
              </template>
            </template>
          </IlisTable>
        </div>

        <!-- 申请说明 -->
        <div>
          <BaseTitle>申请说明</BaseTitle>
          <a-textarea
            :value="detailData.description"
            :rows="3"
            :disabled="true"
            read-only
            placeholder="暂无申请说明"
          />
        </div>
      </div>
    </a-spin>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { BaseTitle } from '~/components/UI'
import { getPurchaseApplyDetail } from '../api'
import { PurchaseApplyDetailEntity } from '../entity/PurchaseApplyDetailEntity'

const props = defineProps<IDialogPropsParam<null, { id: string }>>()

const fieldList = computed(() => PurchaseApplyDetailEntity.getTableFieldList().filter(item => !['operation'].includes(item)))

const visible = ref(true)
const loading = ref(false)
const dataSource = ref<PurchaseApplyDetailEntity[]>([])

const detailData = reactive({
  applicantName: '',
  createDate: '',
  status: '',
  description: '',
})

function formatSubtotal(record: PurchaseApplyDetailEntity): string {
  if (!record.amount)
    return '0.00'
  return record.amount.toFixed(2)
}

async function loadDetail() {
  if (!props.param.id)
    return

  try {
    loading.value = true
    const res = await getPurchaseApplyDetail(props.param.id)

    if (res.data) {
      detailData.applicantName = res.data.applicantName || ''
      detailData.createDate = res.data.createDate || ''
      detailData.status = res.data.status || ''
      detailData.description = res.data.description || ''

      dataSource.value = (res.data.applyItems || []).map((item: any) =>
        new PurchaseApplyDetailEntity().fromJSON({
          id: item.id,
          materialId: item.materialId,
          materialName: item.materialName,
          materialSpecification: item.materialSpecification,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          amount: item.amount,
          custodian: item.custodian,
          remark: item.remark,
        }),
      )
    }
  }
  catch (error) {
    console.error('加载详情失败:', error)
    message.error('加载详情失败')
  }
  finally {
    loading.value = false
  }
}

function onClosed() {
  dataSource.value = []
  detailData.applicantName = ''
  detailData.createDate = ''
  detailData.status = ''
  detailData.description = ''
}

onMounted(() => {
  loadDetail()
})
</script>
