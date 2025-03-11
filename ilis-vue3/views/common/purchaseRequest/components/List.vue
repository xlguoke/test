<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-input v-model:value.trim="queryForm.requestCode" placeholder="申请单号" />
      <a-select
        v-model:value="queryForm.status"
        class="w-[220px]"
        allow-clear
        placeholder="申请状态"
      >
        <a-select-option v-for="item in RequestStatusDict" :key="item.key" :value="item.key">
          {{ item.label }}
        </a-select-option>
      </a-select>

      <a-button type="primary" @click="onSearch()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
      <a-button @click="ilisAdvancedQuery.open()">
        高级查询
      </a-button>
    </a-space>

    <!-- 高级查询 -->
    <AdvancedQuery :entity="ilisAdvancedQuery" />

    <a-space class="mt-4">
      <a-button type="primary" @click="onAdd">
        新增
      </a-button>
      <a-button @click="onBatchSubmit">
        提交
      </a-button>
      <a-button :loading="exportLoading" @click="onExport">
        导出
      </a-button>
      <IlisCustomColumns
        :type="customColumnsType"
        @confirm="handleReloadTable()"
      >
        列筛选
      </IlisCustomColumns>
    </a-space>

    <a-flex class="flex-1 mt-4 overflow-hidden" vertical>
      <div ref="tableBoxRef" class="flex-1 overflow-hidden">
        <IlisTable
          show-index
          row-key="id"
          :loading="loading"
          :table-height="tableHeight"
          :data-source="dataSource"
          :entity="PurChaseRecordEntity"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="customRow"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'requestTime'">
              {{ record.requestTime ? dayjs(record.requestTime).format("YYYY-MM-DD HH:mm:ss") : "" }}
            </template>
            <template v-if="column.dataIndex === 'status'">
              {{ RequestStatusDict.getLabelByKey(record.status) }}
            </template>
            <template v-if="column.dataIndex === 'Action'">
              <a-space>
                <a-button v-if="![RequestStatusType.审核中, RequestStatusType.已完成].includes(record.status)" type="link" @click.stop="onEdit(record)">
                  编辑
                </a-button>
                <a-button v-if="[RequestStatusType.待提交, RequestStatusType.未通过].includes(record.status)" type="link" @click.stop="onSubmit(record)">
                  提交
                </a-button>
                <a-button type="link" @click.stop="onCheckDetail(record)">
                  详情
                </a-button>
                <a-button v-if="![RequestStatusType.审核中, RequestStatusType.已完成].includes(record.status)" type="link" @click.stop="onDel(record)">
                  删除
                </a-button>
                <a-button type="link" @click.stop="onCheckLog(record)">
                  日志
                </a-button>
              </a-space>
            </template>
          </template>
        </IlisTable>
      </div>
      <div v-if="selectedRow" class="h-[220px] mb-4">
        <a-table
          bordered
          row-key="id"
          :columns="checkColumns"
          :data-source="itemList"
          :pagination="false"
          :loading="checkLoading"
          :scroll="{ y: 180 }"
        />
      </div>
    </a-flex>

    <!-- 新增/编辑 -->
    <CreateForm
      v-model:open="createVisible"
      :edit-id="editId"
      :check-id="checkId"
      @on-save="onSearch()"
    />

    <!-- 提交审批弹窗 -->
    <SubmitAudit v-model:open="auditVisible" :ids="submitIds" @on-submit="getList()" />

    <!-- 查看日志 -->
    <CheckLogs ref="CheckLogsRef" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { Modal, message } from 'ant-design-vue'
import { deletePurchase, purchaseDetails, purchaseExport, purchaseList } from '../api'
import {
  AdvancedQueryConfigs,
  RequestStatusDict,
  RequestStatusType,
  RequestType,
  getColumnsByType,
  getRequestType,
} from '../index.ts'
import CreateForm from './CreateForm.vue'
import SubmitAudit from './SubmitAudit.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import AdvancedQuery from '~/components/IlisAdvancedQuery/AdvancedQuery.vue'
import { IlisAdvancedQuery } from '~/components/IlisAdvancedQuery'
import type { GetPurchaseListParams, PurchaseListItem } from '~/views/common/purchaseRequest/interface/purchaseList.ts'

import { IlisTable } from '~/components/ilisComponent'
import { PurChaseRecordEntity } from '~/views/common/purchaseRequest/PurChaseRecordEntity.ts'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'
import { getOrgComboTree } from '~/api/common.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'

const requestType = getRequestType()

const { tableHeight, tableBoxRef, initTableHeight } = useTableHeight()

const checkColumns = computed(() => {
  return getColumnsByType(requestType)
})

const customColumnsType = computed(() => {
  if (requestType === RequestType.化学品) {
    return 'purchase_request_chemical'
  }
  else {
    return 'purchase_request_consumable'
  }
})

const checkLoading = ref(false)

const exportLoading = ref(false)

const auditVisible = ref(false)

const selectedRow = ref<PurchaseListItem>()

const queryForm = ref<GetPurchaseListParams>({
  requestType,
})

const itemList = ref([])

const createVisible = ref(false)

const editId = ref<string>()

const checkId = ref<string>()

const submitIds = ref<string[]>([])

const CheckLogsRef = ref()

const {
  loading,
  customColumns,
  dataSource,
  getPagination,
  handleSearch,
  getRowSelection,
  selectedRowKeys,
  selectedRows,
  getList,
  page,
  size,
  handleReloadTable,
} = useTableHooks<PurchaseListItem>({
  api: purchaseList,
  customType: customColumnsType.value,
  query: queryForm,
  responseDataTransform: (res) => {
    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

const ilisAdvancedQuery = reactive(new IlisAdvancedQuery<GetPurchaseListParams>({
  configs: AdvancedQueryConfigs,
  queryParams: queryForm.value,
  onQuery: () => {
    onSearch()
  },
})) as IlisAdvancedQuery<GetPurchaseListParams>

// 加载高级查询部门下拉
getOrgComboTree().then((res) => {
  const data = res.data as IDepartmentEntity[]
  data.shift()

  ilisAdvancedQuery.setConfigProps('requestDepartmentId', {
    treeData: data,
  })
})

function customRow(record: PurchaseListItem) {
  return {
    onClick: () => {
      if (selectedRow.value?.id !== record.id) {
        selectedRow.value = { ...record }
        getPurchaseDetails(record.id)
      }
    },
  }
}

function rowClassName(record: PurchaseListItem) {
  return selectedRow.value?.id === record.id ? 'table-striped' : ''
}

async function getPurchaseDetails(id) {
  checkLoading.value = true
  const res = await purchaseDetails(id).finally(() => {
    checkLoading.value = false
  })
  itemList.value = res.data.items
  initTableHeight()
}

function onReset() {
  queryForm.value = {}
  queryForm.value.requestType = requestType

  ilisAdvancedQuery.queryParams = queryForm.value
  ilisAdvancedQuery.updateQueryTags()
  onSearch()
}

function onSearch() {
  selectedRow.value = undefined
  handleSearch()
  initTableHeight()
}

function onAdd() {
  editId.value = undefined
  checkId.value = undefined
  createVisible.value = true
}

function onEdit(record: PurchaseListItem) {
  editId.value = record.id
  checkId.value = undefined
  createVisible.value = true
}

function onCheckDetail(record: PurchaseListItem) {
  editId.value = undefined
  checkId.value = record.id
  createVisible.value = true
}

function onDel(record: PurchaseListItem) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      await deletePurchase(record.id)
      message.success('操作成功！')
      onSearch()
    },
  })
}

function onSubmit(record: PurchaseListItem) {
  submitIds.value = [record.id]
  auditVisible.value = true
}

function onBatchSubmit() {
  if (!selectedRows.value.length) {
    message.warn('请勾选要提交的数据！')
    return
  }

  if (selectedRows.value.some(i => ![RequestStatusType.待提交, RequestStatusType.未通过].includes(i.status))) {
    message.warn('只能提交【待提交】和【未通过】状态下的数据，请重新勾选后操作！')
    return
  }

  submitIds.value = [...selectedRowKeys.value]
  auditVisible.value = true
}

async function onExport() {
  exportLoading.value = true
  const res = await purchaseExport({
    ...queryForm.value,
    page: page.value,
    size: size.value,
  }).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '采购申请台账.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function onCheckLog(record: PurchaseListItem) {
  CheckLogsRef.value.open({
    objectType: LogType.采购申请审批,
    objectId: record.id,
    relationQry: true,
  })
}
</script>

<style scoped lang="less">
:deep(.table-striped) td {
  background-color: rgba(0, 102, 236, 0.4)!important;
}
</style>
