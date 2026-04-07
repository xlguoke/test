<template>
  <ht-modal
    v-model:open="internalOpen"
    title="从采购申请单新增"
    width="85%"
    :mask-closable="false"
    :after-close="onClosed"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="flex flex-col gap-3 w-full">
      <!-- 搜索区域 -->
      <a-space>
        <a-input
          v-model:value="queryForm.requestCode"
          class="w-[300px]"
          placeholder="请输入采购单号"
          allow-clear
          @press-enter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">
          查询
        </a-button>
      </a-space>

      <!-- 申请单表格 -->
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :entity="PurchaseApplyListEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :loading="loading"
          :table-height="tableHeight"
          :row-selection="getRowSelection({ type: 'radio' })"
          :custom-row="getCustomRow()"
          bordered
        />
      </div>

      <!-- 明细表格 -->
      <div class="min-h-[180px]">
        <BaseTitle>申请单明细</BaseTitle>
        <IlisTable
          row-key="id"
          :entity="PurchaseApplyItemEntity"
          :data-source="selectedApply?.items || []"
          :pagination="false"
          bordered
          :table-height="200"
        />
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { PurchaseApplyItemEntity, PurchaseApplyListEntity } from './entity/PurchaseApplySelectorEntity'

/**
 * # 采购申请分页查询参数
 */
interface GetPurchasePaginationParams {
  page?: number
  size?: number
  requestCode?: string
  status?: string
  requestType?: string
}

const props = defineProps<IDialogPropsParam<PurchaseApplyItemEntity[], null>>()

/**
 * # 采购申请分页查询
 */
function getPurchasePagination(params: GetPurchasePaginationParams) {
  return IlisApiHelper.get('/rest/purchase/pagination', params)
}

/**
 * # 采购申请详情
 */
function getPurchaseDetail(id: string) {
  return IlisApiHelper.get(`/rest/purchase/${id}`)
}

const internalOpen = ref(true)
const loading = ref(false)
const selectedApply = ref<any>(null)

const queryForm = ref({
  requestCode: '',
  page: 1,
  size: 10,
  status: 'COMPLETED',
  requestType: 'CHEMICAL',
})

// 上层表格hooks
const {
  dataSource,
  tableHeight,
  tableBoxRef,
  selectedRowKeys,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleSearch: hooksHandleSearch,
} = useTableHooks<any>({
  api: getPurchasePagination,
  query: queryForm,
  immediate: false,
})

// 打开时初始化
selectedApply.value = null
handleSearch()

async function handleSearch() {
  loading.value = true
  try {
    await hooksHandleSearch()
  }
  finally {
    loading.value = false
  }
}

// 选中项变更
watch(() => selectedRowKeys.value, (newVal) => {
  if (newVal.length) {
    fetchDetail(newVal[0] as string)
  }
})

// 加载明细
async function fetchDetail(id: string) {
  loading.value = true
  try {
    const { data } = await getPurchaseDetail(id)
    selectedApply.value = data
  }
  finally {
    loading.value = false
  }
}

function handleConfirm() {
  if (!selectedApply.value) {
    message.warning('请选择采购申请单')
    return
  }

  props.onConfirm(selectedApply.value.items || [])
  internalOpen.value = false
}

function handleCancel() {
  internalOpen.value = false
}
</script>
