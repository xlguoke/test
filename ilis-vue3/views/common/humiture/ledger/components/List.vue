<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm.status"
        allow-clear
        placeholder="状态"
        class="w-[220px]"
      >
        <a-select-option v-for="item in LedgerStatusTypeDict" :key="item.key" :value="item.key">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-input v-model:value.trim="queryForm.quickQry" class="w-[220px]" placeholder="台账编号、台账名称、创建人" />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
    </a-space>

    <a-space class="mt-4">
      <a-button v-permission="'humiture_ledger_add'" @click="setCreateLedgerVisible(true)">
        创建台账
      </a-button>
      <a-button v-permission="'humiture_ledger_export'" :loading="exportLoading" @click="onExport">
        导出台账
      </a-button>
      <a-button v-permission="'humiture_ledger_print'" @click="onPrint">
        打印台账
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'createDate'">
            {{ record.createDate ? dayjs(record.createDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'ledgerStartDate'">
            {{ record.ledgerStartDate ? dayjs(record.ledgerStartDate).format("YYYY-MM-DD") : "" }}
          </template>
          <template v-if="column.dataIndex === 'ledgerEndDate'">
            {{ record.ledgerEndDate ? dayjs(record.ledgerEndDate).format("YYYY-MM-DD") : "" }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span
              :class="{
                'text-orange-500': record.status === LedgerStatusType.审核不通过,
              }"
            >{{ LedgerStatusTypeDict.getLabelByKey(record.status) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button
              v-if="[LedgerStatusType.待提交].includes(record.status)"
              v-permission="'humiture_ledger_submit'"
              type="link"
              size="small"
              @click="onSubmit(record)"
            >
              提交
            </a-button>
            <a-button type="link" size="small" @click="onCheckDetail(record)">
              详情
            </a-button>
            <a-button
              v-if="record.status !== LedgerStatusType.待提交"
              v-permission="'humiture_ledger_log'"
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

    <!-- 创建台账 -->
    <CreateLedger v-model:open="createLedgerVisible" @on-save="handleSearch()" />

    <!-- 查看台账 -->
    <CreateLedger v-model:open="checkLedgerVisible" :check-id="checkLedgerId" />

    <!-- 查看日志 -->
    <CheckLogs ref="checkLogsRef" />

    <!-- 提交审核 -->
    <SubmitAudit ref="submitAuditRef" @on-submit="handleSearch()" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import SubmitAudit from './SubmitAudit.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import type {
  HumitureLedgerDataItem,
  HumitureLedgerListParams,
} from '~/views/common/humiture/ledger/api/getHumitureLedgerList.ts'
import { getHumitureLedgerList } from '~/views/common/humiture/ledger/api/getHumitureLedgerList.ts'
import { LedgerStatusType, LedgerStatusTypeDict } from '~/views/common/humiture/ledger'
import CreateLedger from '~/views/common/humiture/record/components/CreateLedger.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { exportHumitureLedger } from '~/views/common/humiture/ledger/api/exportHumitureLedger.ts'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'
import { IlisPrintUdr, PrintUdrTempleteType } from '~/utils/IlisPrintUdr.ts'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '台账编号', dataIndex: 'ledgerSn', width: 120 },
  { title: '台账名称', dataIndex: 'name', width: 120 },
  { title: '开始时间', dataIndex: 'ledgerStartDate', width: 120 },
  { title: '结束时间', dataIndex: 'ledgerEndDate', width: 120 },
  { title: '功能室', dataIndex: 'laboratoryName', width: 120, ellipsis: true },
  { title: '创建人', dataIndex: 'createName', width: 120 },
  { title: '创建时间', dataIndex: 'createDate', width: 120 },
  { title: '操作', dataIndex: 'action', width: 120, fixed: 'right' },
]

const ilisPrintUdr = new IlisPrintUdr()

const { tableHeight, tableBoxRef } = useTableHeight()

const [createLedgerVisible, setCreateLedgerVisible] = useStateHooks(false)

const checkLedgerId = ref('')

const checkLedgerVisible = ref(false)

const queryForm = ref<HumitureLedgerListParams>({})

const exportLoading = ref(false)

const checkLogsRef = ref()

const submitAuditRef = ref()

const {
  loading,
  dataSource,
  getPagination,
  getRowSelection,
  selectedRowKeys,
  handleSearch,
} = useTableHooks<HumitureLedgerDataItem>({
  api: getHumitureLedgerList,
  query: queryForm,
})

function onCheckDetail(record: HumitureLedgerDataItem) {
  checkLedgerId.value = record.id
  checkLedgerVisible.value = true
}

function onReset() {
  queryForm.value = {}
  handleSearch()
}

function onCheckLog(record: HumitureLedgerDataItem) {
  checkLogsRef.value.open({
    objectType: LogType.温湿度巡查台账,
    objectId: record.id,
    relationQry: true,
  })
}

async function onExport() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要导出的台账数据！')
    return
  }

  exportLoading.value = true
  const res = await exportHumitureLedger(selectedRowKeys.value.join(',')).finally(() => {
    exportLoading.value = false
  })
  if (res.code !== 20010) {
    await downloader.excute(res.data, '温湿度台账.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function onSubmit(record: HumitureLedgerDataItem) {
  submitAuditRef.value.open([record.id])
}

function onPrint() {
  if (selectedRowKeys.value.length !== 1) {
    message.warn('请勾选单条数据进行打印！')
    return
  }

  ilisPrintUdr.commonPrint(selectedRowKeys.value as string[], PrintUdrTempleteType.温湿度台账打印)
}
</script>
