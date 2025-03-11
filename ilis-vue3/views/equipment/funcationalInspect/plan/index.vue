<template>
  <IlisContainer app-id="common_eq_auth">
    <div class=" h-full flex flex-col">
      <a-space>
        <a-select v-model:value.trim="queryForm.status" placeholder="请选择状态" class="w-[220px]">
          <a-select-option v-for="item in StatusTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <a-input
          v-model:value.trim="queryForm.q"
          class="w-[320px]"
          placeholder="请输入计划编号或计划名称后查询"
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
        <a-button v-permission="'funInspectPlan:add'" @click="onAddPlan">
          新增计划
        </a-button>
        <a-button v-permission="'funInspectPlan:export'" :loading="exportLoading" @click="onExport">
          导出
        </a-button>
        <IlisCustomColumns
          type="equipment_function_check_plan"
          @confirm="handleReloadTable()"
        >
          列筛选
        </IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          show-index
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentFunCheckPlanEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-columns="customColumns"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag v-if="record.status === StatusType.填写中" color="#555555">
                填写中
              </a-tag>
              <a-tag v-if="record.status === StatusType.待提交" color="#0066ec">
                待提交
              </a-tag>
              <a-tag v-if="record.status === StatusType.审核中" color="#f59a23">
                审核中
              </a-tag>
              <a-tag v-if="record.status === StatusType.未通过" color="#d9001b">
                未通过
              </a-tag>
              <a-tag v-if="record.status === StatusType.已完成" color="#70b603">
                已通过
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button v-if="[StatusType.填写中, StatusType.待提交, StatusType.未通过].includes(record.status)" v-permission="'funInspectPlan:edit'" type="link" @click="onEdit(record)">
                编辑
              </a-button>
              <a-button v-if="[StatusType.审核中, StatusType.已完成].includes(record.status)" type="link" @click="onCheckDetail(record)">
                查看
              </a-button>
              <a-button v-if="[StatusType.待提交, StatusType.未通过].includes(record.status)" v-permission="'funInspectPlan:submit'" type="link" @click="onSubmit(record)">
                提交审核
              </a-button>
              <a-button v-if="[StatusType.待提交, StatusType.填写中, StatusType.未通过].includes(record.status)" v-permission="'funInspectPlan:delete'" type="link" danger @click="onDel(record)">
                删除
              </a-button>
              <a-button v-if="[StatusType.审核中].includes(record.status)" v-permission="'funInspectPlan:revoke'" type="link" danger @click="onRevoke(record)">
                撤回
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

    <!-- 提交审批弹窗 -->
    <a-modal
      v-model:open="auditVisible"
      centered
      width="500px"
      title="提交审核"
      :body-style="{ height: '400px', overflowY: 'auto' }"
      :keyboard="false"
      :mask-closable="false"
      :confirm-loading="processLoading"
      @ok="handleSubmitProcess()"
    >
      <ProcessForm
        ref="processFormRef"
        class="mt-4"
        :process-type="ProcessType.EQUIPMENT_FUNCTION_CHECK_PLAN"
        :label-col="{ style: { width: '100px' } }"
      />
    </a-modal>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { EquipmentFunCheckPlanEntity } from './EquipmentFunCheckPlanEntity'
import {
  GetPlanListParams,
  StatusType,
  StatusTypeDict,
  delPlan,
  exportPlan,
  getPlanList,
  revokePlan,
  submitPlan,
} from './api'
import AddPlan from './component/AddPlan.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisCustomColumns, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { ProcessType } from '~/components/commonProcess'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'

const queryForm = ref(new GetPlanListParams())

const auditVisible = ref(false)

const processLoading = ref(false)

const exportLoading = ref(false)

const processFormRef = ref()

const checkLogsRef = ref()

const actionRow = ref()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReloadTable,
  handleSortChange,
  selectedRowKeys,
  selectedRows,
  getRowSelection,
  getList,
  total,
} = useTableHooks<EquipmentFunCheckPlanEntity>({
  api: getPlanList,
  customType: 'equipment_function_check_plan',
  query: queryForm,
  responseDataTransform: (res) => {
    selectedRows.value = []
    selectedRowKeys.value = []

    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

function onSearch() {
  selectedRowKeys.value = []
  selectedRows.value = []
  handleSearch()
}

function onReset() {
  queryForm.value = new GetPlanListParams()
  onSearch()
}

function onSubmit(record) {
  actionRow.value = record
  auditVisible.value = true
}

function onEdit(record) {
  AnyDialogHelper.showModel(AddPlan, {
    isEdit: true,
    record,
  }).then(() => {
    getList()
  })
}

function onCheckDetail(record) {
  AnyDialogHelper.showModel(AddPlan, {
    isDetail: true,
    record,
  })
}

async function onCheckLog(record) {
  checkLogsRef.value.open({
    objectType: LogType.设备功能核查计划,
    objectId: record.id,
    relationQry: true,
  })
}

function onAddPlan() {
  AnyDialogHelper.showModel(AddPlan).then(() => {
    getList()
  })
}

function onDel(record: EquipmentFunCheckPlanEntity) {
  Modal.confirm({
    title: '您正在删除设备功能核查计划！',
    content: '删除后将无法恢复，您确定要删除当前的设备功能核查计划吗？',
    onOk: async () => {
      await delPlan(record.id)
      message.success('删除成功！')
      getList()
    },
  })
}

function onRevoke(record: EquipmentFunCheckPlanEntity) {
  Modal.confirm({
    title: '提示',
    content: '确认撤回吗？',
    onOk: async () => {
      await revokePlan(record.id)
      message.success('操作成功！')
      getList()
    },
  })
}

async function onExport() {
  if (total.value === 0) {
    message.warn('没有可导出的数据！')
    return
  }

  exportLoading.value = true
  const res = await exportPlan(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '设备功能核查计划.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

async function handleSubmitProcess() {
  const data = await processFormRef.value.getProcessFormData()
  data.presetAuditors = data.presetAuditers
  data.processForm = data.formPropertyJson
  data.id = actionRow.value.id
  delete data.presetAuditers

  processLoading.value = true
  await submitPlan(data).finally(() => {
    processLoading.value = false
  })
  message.success('提交成功')
  getList()
  processLoading.value = false
  auditVisible.value = false
}
</script>
