<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm.laboratoryId"
        allow-clear
        style="width: 240px;"
        placeholder="功能室"
        :options="laboratoryOptions"
      />
      <a-range-picker v-model:value="recordDate" class="w-full" value-format="YYYY-MM-DD" />
      <a-button type="primary" @click="onSearch">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
      <a-checkbox v-model:checked="queryForm.status" class="ml-4" @change="handleSearch()">
        只看待处理的
      </a-checkbox>
    </a-space>

    <a-space class="mt-4">
      <a-button v-permission="'humiture_abnormal_export'" :loading="exportLoading" @click="onExport">
        导出台账
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'recordDate'">
            {{ record.recordDate ? dayjs(record.recordDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'temStatus'">
            <span
              :class="{
                'text-red-500': record.temStatus !== MStatus.正常,
              }"
            >
              {{ MStatusDict.getLabelByKey(record.temStatus) }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'humStatus'">
            <span
              :class="{
                'text-red-500': record.humStatus !== MStatus.正常,
              }"
            >
              {{ MStatusDict.getLabelByKey(record.humStatus) }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span
              :class="{
                'text-orange-500': record.status === LedgerStatusType.审核不通过,
              }"
            >{{ LedgerStatusTypeDict.getLabelByKey(record.status) }}</span>
          </template>
          <template v-if="column.dataIndex === 'type'">
            {{ TypeDict.getLabelByKey(record.type) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button
              v-if="[LedgerStatusType.待提交, LedgerStatusType.审核不通过].includes(record.status)"
              v-permission="'humiture_abnormal_submit'"
              type="link"
              size="small"
              @click="onSubmitAudit(record)"
            >
              处理
            </a-button>
            <a-button type="link" size="small" @click="onCheckDetail(record)">
              详情
            </a-button>
            <a-button
              v-if="![LedgerStatusType.待提交, LedgerStatusType.审核不通过].includes(record.status)"
              v-permission="'humiture_abnormal_log'"
              type="link"
              size="small"
              @click="onCheckLog(record)"
            >
              日志
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 提交审核 -->
    <SubmitAudit v-model:open="submitVisible" :data-source="submitDataSource" @on-save="handleSearch()" />

    <!-- 审核详情 -->
    <SubmitAuditDetail v-model:open="submitDetailVisible" :data-source="submitDataSource" />

    <!-- 查看日志 -->
    <CheckLogs ref="checkLogsRef" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import SubmitAudit from './SubmitAudit.vue'
import SubmitAuditDetail from './SubmitAuditDetail.vue'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import type {
  HumitureRecordDataItem,
  HumitureRecordListParams,
} from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import {
  getHumitureRecordList,
} from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { exportHumitureRecord } from '~/views/common/humiture/recordAbnormal/api/exportHumitureRecord.ts'
import { LedgerStatusType, LedgerStatusTypeDict } from '~/views/common/humiture/ledger'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'
import { MStatus, MStatusDict, TypeDict } from '~/views/common/humiture/record'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '处理状态', dataIndex: 'status', width: 100 },
  { title: '巡查时间', dataIndex: 'recordDate', width: 160 },
  { title: '功能室', dataIndex: 'laboratoryName', width: 140 },
  { title: '巡查模式', dataIndex: 'type', width: 120 },
  { title: '标准温度（℃）', dataIndex: 'standardTem', width: 140 },
  { title: '巡查温度（℃）', dataIndex: 'tem', width: 140 },
  { title: '温度状态', dataIndex: 'temStatus', width: 140 },
  { title: '标准湿度（%RH）', dataIndex: 'standardHum', width: 140 },
  { title: '巡查湿度（%RH）', dataIndex: 'hum', width: 140 },
  { title: '湿度状态', dataIndex: 'humStatus', width: 120 },
  { title: '操作', dataIndex: 'action', width: 180, fixed: 'right' },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const checkLogsRef = ref()

const exportLoading = ref(false)

const submitVisible = ref(false)

const submitDetailVisible = ref(false)

const submitDataSource = ref<HumitureRecordDataItem>()

const recordDate = ref([])

const queryForm = ref<HumitureRecordListParams>({
  abnormal: true,
})

const { laboratoryOptions } = useLaboratoryOptionsHook()

const {
  loading,
  dataSource,
  getRowSelection,
  getPagination,
  handleSearch,
} = useTableHooks<HumitureRecordDataItem>({
  api: getHumitureRecordList,
  query: queryForm,
})

function onSearch() {
  queryForm.value.recordStartDate = recordDate.value ? recordDate.value[0] : undefined
  queryForm.value.recordEndDate = recordDate.value ? recordDate.value[1] : undefined

  handleSearch()
}

function onReset() {
  queryForm.value = {
    abnormal: true,
  }
  recordDate.value = []
  handleSearch()
}

async function onExport() {
  exportLoading.value = true
  const res = await exportHumitureRecord(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '异常记录.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function onSubmitAudit(record: HumitureRecordDataItem) {
  submitDataSource.value = { ...record }
  submitVisible.value = true
}

function onCheckDetail(record: HumitureRecordDataItem) {
  submitDataSource.value = { ...record }
  submitDetailVisible.value = true
}

function onCheckLog(record: HumitureRecordDataItem) {
  checkLogsRef.value.open({
    objectType: LogType.温湿度异常处理,
    objectId: record.id,
    relationQry: true,
  })
}
</script>
