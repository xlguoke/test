<template>
  <AppProvider>
    <HtModal
      v-model:open="internalOpen"
      title="不合格上报"
      width="880px"
      :confirm-loading="loading"
      @ok="cancel"
      @cancel="cancel"
    >
      <div class="py-4">
        <a-space v-if="!readonly">
          <a-button type="primary" @click="onAdd">
            新增上报
          </a-button>
        </a-space>
        <a-table
          class="mt-4"
          row-key="id"
          :columns="columns"
          :data-source="dataSource"
          :pagination="false"
          :loading="loading"
          bordered
          :scroll="{
            y: 320,
          }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'statusDesc'">
              <a-tag v-if="StatusType.审核中 === record.status" color="#f59a23">
                {{ record.statusDesc }}
              </a-tag>
              <a-tag v-if="StatusType.审核通过 === record.status" color="#4b7902">
                已通过
              </a-tag>
              <a-tag v-if="StatusType.审核未通过 === record.status" color="#ff0000">
                未通过
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'Action'">
              <a-button v-if="!readonly && StatusType.审核中 === record.status" type="link" @click="onRecall(record)">
                撤回
              </a-button>
              <a-button type="link" size="small" @click="onCheckLog(record)">
                日志
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </HtModal>

    <!-- 查看日志 -->
    <CheckLogs ref="checkLogsRef" />
  </AppProvider>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import type {
  NonconformityReportDTO,
} from './api.ts'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import CheckLogs from '~/components/CheckLogs.vue'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import { LogType } from '~/enum/LogType.ts'
import {
  getNonconformityReportDesc,
  getNonconformityReportList,
  nonconformityReport,
  nonconformityReportRecall,
  StatusType,
} from './api.ts'
import AddReportDesc from './components/AddReportDesc.vue'

const urlSearchParams = new URLSearchParams(location.search)

const readonly = urlSearchParams.get('readonly')

const testTaskId = ref('')

const loading = ref(false)

const dataSource = ref<NonconformityReportDTO[]>([])

const internalOpen = ref(false)

const checkLogsRef = ref()

const columns: ColumnType[] = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 45,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '不合格情况',
    dataIndex: 'description',
    width: 180,
    ellipsis: true,
  },
  {
    title: '创建人',
    dataIndex: 'createName',
    width: 85,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: 120,
    sorter: (a: any, b: any) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
  },
  {
    title: '状态',
    dataIndex: 'statusDesc',
    width: 150,
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: 80,
  },
]

function cancel() {
  internalOpen.value = false
}

async function onAdd() {
  const res = await getNonconformityReportDesc(testTaskId.value)
  const desc = res.data

  const description = await AnyDialogHelper.showModel(AddReportDesc, { desc })

  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.TASK_NONCONFORMITY_REPORTS,
    processId: testTaskId.value,
    submitAuditApi: nonconformityReport,
    submitDataTransfer: data => ({
      description,
      testTaskId: testTaskId.value,
      formPropertyStr: data.formPropertyJson,
      presetAuditorsStr: data.presetAuditers,
    }),
    hideRemark: true,
  })

  message.success('提交成功！')
  getList()
}

async function getList() {
  if (!testTaskId.value) {
    return
  }

  const res = await getNonconformityReportList(testTaskId.value)
  dataSource.value = res.data
}

async function onCheckLog(record) {
  checkLogsRef.value.open({
    objectType: LogType.任务不合格上报,
    objectId: record.id,
    relationQry: true,
  })
}

function onRecall(record) {
  Modal.confirm({
    title: '提示',
    content: '确认撤回吗？',
    onOk: async () => {
      await nonconformityReportRecall(record.id)
      message.success('操作成功！')
      getList()
    },
  })
}

window.$unqualifiedReporting = {
  open: (_testTaskId: string) => {
    testTaskId.value = _testTaskId
    getList()
    internalOpen.value = true
  },
}
</script>
