<template>
  <IlisContainer app-id="nonconformity_report">
    <div class=" h-full flex flex-col">
      <a-space>
        <a-select v-model:value="queryForm.status" placeholder="请选择状态" class="w-[120px]">
          <a-select-option v-for="item in StatusTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <a-range-picker v-model:value="checkDate" :value-format="EDateFormatType.YYYY_MM_DD" />
        <a-input
          v-model:value.trim="queryForm.quickQry"
          style="width: 420px;"
          placeholder="请输入任务编号、样品编号、记录编号、报告编号或样品名称"
          @press-enter="onSearch()"
        />

        <a-button type="primary" @click="onSearch()">
          查询
        </a-button>
        <a-button @click="onReset()">
          重置
        </a-button>
      </a-space>

      <a-space class="my-4">
        <IlisCustomColumns
          type="TASK-NONCONFORMITY-REPORTS"
          @confirm="handleReloadTable()"
        >
        </IlisCustomColumns>
        <a-button :loading="exportLoading" @click="onExport">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="UnqualifiedReportEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :custom-columns="customColumns"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag v-if="StatusType.审核中 === record.status" color="#f59a23">
                审核中
              </a-tag>
              <a-tag v-if="StatusType.审核通过 === record.status" color="#4b7902">
                已通过
              </a-tag>
              <a-tag v-if="StatusType.审核未通过 === record.status" color="#ff0000">
                未通过
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" @click="onCheckDetail(record)">
                详情
              </a-button>
              <a-button type="link" size="small" @click="onCheckLog(record)">
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>

    <!-- 查看日志 -->
    <CheckLogs ref="checkLogsRef" />
  </IlisContainer>
</template>

<script setup lang='ts'>
import { message, Modal } from 'ant-design-vue'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import { OrderType } from '~/interface/ITableHookConfig.ts'
import { getNonconformityReportPageList, GetNonconformityReportPageListQuery, nonconformityReportExport } from './api'
import { StatusType, StatusTypeDict } from './api.ts'
import { UnqualifiedReportEntity } from './UnqualifiedReportEntity'

const checkDate = ref<string[]>([])

const queryForm = ref(new GetNonconformityReportPageListQuery())

const exportLoading = ref(false)

const checkLogsRef = ref()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReloadTable,
  total,
} = useTableHooks<UnqualifiedReportEntity>({
  api: getNonconformityReportPageList,
  customType: 'TASK-NONCONFORMITY-REPORTS',
  query: queryForm,
  responseDataTransform: (res) => {
    if (!res.rows) {
      return {
        rows: [],
        total: 0,
      }
    }

    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

function handleSortChange(_pagination: any, _filters: any, sorter: any) {
  const { order, field } = sorter
  if (!field) {
    queryForm.value.order = undefined
    queryForm.value.orderBy = undefined
    return
  }

  const desc = order === 'descend' ? OrderType.DESC : OrderType.ASC

  queryForm.value.order = desc
  queryForm.value.orderBy = field === 'createDate' ? 'create_date' : field
  handleSearch()
}

function onSearch() {
  if (checkDate.value && checkDate.value[0] && checkDate.value[1]) {
    queryForm.value.createDateStart = checkDate.value[0]
    queryForm.value.createDateEnd = checkDate.value[1]
  }
  else {
    queryForm.value.createDateStart = undefined
    queryForm.value.createDateEnd = undefined
  }

  handleSearch()
}

function onReset() {
  checkDate.value = []
  queryForm.value = new GetNonconformityReportPageListQuery()
  onSearch()
}

async function onExport() {
  if (total.value === 0) {
    message.warn('没有可导出的数据！')
    return
  }

  exportLoading.value = true
  const res = await nonconformityReportExport(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '任务不合格上报记录.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function onCheckDetail(record) {
  const url = `/ilis2/testTaskController.do?goTestTaskDetail&id=${record.testTaskId}&readonly=1&readType=5`
  window.open(url)
}

async function onCheckLog(record) {
  checkLogsRef.value.open({
    objectType: LogType.任务不合格上报,
    objectId: record.id,
    relationQry: true,
  })
}
</script>
