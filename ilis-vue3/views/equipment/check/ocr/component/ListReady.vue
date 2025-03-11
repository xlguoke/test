<template>
  <a-space direction="vertical" style="width: 100%;">
    <div class="search">
      <a-form
        ref="formRef"
        :model="formState"
        layout="inline"
        @submit="handleSearch"
      >
        <a-form-item name="quickQry">
          <a-input
            v-model:value="formState.quickQry"
            style="width: 330px;"
            placeholder="请输入文件名/设备编号/设备名称/检校确认人"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="timeRange">
          <a-range-picker v-model:value="formState.timeRange" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item name="checkStatus">
          <a-select
            v-model:value="formState.checkStatus"
            style="width: 200px;"
            placeholder="请选择检校状态"
            allow-clear
          >
            <a-select-option v-for="(item) in CheckStatusDict" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <a-space>
      <a-button @click="handleDelete(selectedRows)">
        删除
      </a-button>
    </a-space>
    <a-table
      row-key="id"
      :data-source="dataSource"
      :columns="columns"
      :loading="loading"
      :pagination="getPagination()"
      :row-selection="getRowSelection()"
      :scroll="{
        x: '1400px',
      }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'attachmentName'">
          <a-tooltip @click="handleOpenFile(record as OcrRecordEntity)">
            <template #title>
              {{ record.attachmentName }}
            </template>
            <span style="color: #0866e2;">
              {{ record.attachmentName }}
            </span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a-space size="small">
            <a-button type="link" size="small" @click="handleCheckDetail(record as OcrRecordEntity)">
              查看检校
            </a-button>
            <a-button type="link" size="small" @click="handleCheckAnalysis(record as OcrRecordEntity)">
              查看解析
            </a-button>
            <a-button type="link" size="small" @click="handleDelete([record] as OcrRecordEntity[])">
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <CheckDetail v-model:show="showCheckDetailModal" :ocr="selectedRows[0]" />
    <CheckOcrResultModal v-model:show="showCheckOcrResultModal" :ocr="ocrQuery" />
  </a-space>
</template>

<script lang="ts" setup>
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import { deleteOcr, getOcrPage } from '../api'
import { CheckStatusDict, OcrQueryType, type OcrRecordEntity, OrderType, columnsListReady as columns } from '../index'
import CheckOcrResultModal from '../../../../../components/commonOcr/CheckOcrResultModal.vue'
import CheckDetail from './CheckDetail.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IOcrQueryParams } from '~/components/commonOcr/ocrResultMockData'
import { OcrBusinessType } from '~/components/commonOcr/ocrResultMockData'

const formRef = ref()

const formState = ref({
  quickQry: '',
  checkStatus: undefined,
  timeRange: undefined,
  queryType: OcrQueryType.CONFIRMED,
  order: OrderType.ASC,
  orderBy: 'createDate',
})

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getList,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<OcrRecordEntity>({
  api: getOcrPage,
  formRef,
  query: formState,
  totalKey: 'count',
})

const showCheckOcrResultModal = ref(false)

const showCheckDetailModal = ref(false)

const ocrQuery = computed(() => {
  return {
    businessId: selectedRows.value?.[0]?.id,
    businessType: OcrBusinessType.EQUIPMENT_CERT,
  } as IOcrQueryParams
})

/**
 * # 查看检校结果
 */
async function handleCheckDetail(_q: OcrRecordEntity) {
  if (!_q.eqCheckId) {
    return message.error('记录已删除，不可查看')
  }
  selectedRows.value = [_q]
  selectedRowKeys.value = [_q.id]
  showCheckDetailModal.value = true
}

/**
 * # 查看解析结果
 */
async function handleCheckAnalysis(_q: OcrRecordEntity) {
  selectedRows.value = [_q]
  selectedRowKeys.value = [_q.id]
  showCheckOcrResultModal.value = true
}

/**
 * 删除
 */
function handleDelete(rows: OcrRecordEntity[]) {
  if (rows.length === 0) {
    return message.warning('请选择要操作的数据')
  }
  Modal.confirm({
    title: '确认要删除数据吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后数据无法恢复',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteOcr(rows)
      // 从选中的数据中删除
      const deleteIds = rows.map(item => item.id) as Key[]
      selectedRows.value = selectedRows.value.filter(item => !deleteIds.includes(item.id))
      selectedRowKeys.value = selectedRowKeys.value.filter(item => !deleteIds.includes(item))
      message.success('删除成功')
      getList()
    },
  })
}

/**
 * # 后端排序
 */
function handleTableChange(_pagination: any, _filters: any, sorter: { order: any }) {
  const { order } = sorter
  if (order === 'descend') {
    formState.value.order = OrderType.DESC
  }
  else {
    formState.value.order = OrderType.ASC
  }
  getList()
}

function handleOpenFile(row: OcrRecordEntity) {
  window.open(row.attachmentUrl)
}
</script>

<style>

</style>
