<template>
  <IlisContainer app-id="common_eq_auth">
    <div class=" h-full flex flex-col">
      <a-space>
        <a-tree-select
          v-model:value="queryForm.departmentId"
          class="w-[220px]"
          :tree-data="treeData"
          :field-names="{
            label: 'text',
            value: 'id',
          }"
          allow-clear
          placeholder="请选择核查部门"
          tree-node-filter-prop="text"
        />
        <a-select v-model:value="queryForm.status" placeholder="请选择状态" class="w-[120px]">
          <a-select-option v-for="item in StatusTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <a-range-picker v-model:value="checkDate" :value-format="EDateFormatType.YYYY_MM_DD" />
        <a-input
          v-model:value.trim="queryForm.q"
          class="w-[320px]"
          placeholder="请输入设备名称、设备编号或核查单号后查询"
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
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="addByPlan">
                按计划新增
              </a-menu-item>
              <a-menu-item key="addCheck">
                新增核查
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-permission="'funInspectRecord:add'">
            新增计划
          </a-button>
        </a-dropdown>
        <a-button v-permission="'funInspectRecord:edit'" @click="onBatchEdit">
          批量编辑
        </a-button>
        <a-button v-permission="'funInspectRecord:print'" @click="onPrint">
          打印
        </a-button>
        <a-button v-permission="'funInspectRecord:export'" :loading="exportLoading" @click="onExport">
          导出
        </a-button>
        <IlisCustomColumns
          type="equipment_function_check"
          @confirm="handleReloadTable()"
        >
          列筛选
        </IlisCustomColumns>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentFunCheckRecordEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-columns="customColumns"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'dataFrom'">
              <a v-if="record.planId" href="javascript:;" class="text-blue-500" @click="onCheckPlanDetail(record.planId)">{{ record.dataFrom }}</a>
              <span v-else>{{ record.dataFrom }}</span>
            </template>
            <template v-if="column.dataIndex === 'checkItems'">
              {{ formatCheckItems(record.checkItems) }}
            </template>
            <template v-if="column.dataIndex === 'status'">
              <a-tag v-if="record.status === StatusType.填写中" color="#555555">
                进行中
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
              <a-button v-if="[StatusType.填写中, StatusType.待提交, StatusType.未通过].includes(record.status)" v-permission="'funInspectRecord:edit'" type="link" @click="onEdit(record)">
                编辑
              </a-button>
              <a-button v-if="[StatusType.审核中, StatusType.已完成].includes(record.status)" type="link" @click="onCheckDetail(record)">
                查看
              </a-button>
              <a-button v-if="[StatusType.已完成].includes(record.status)" v-permission="'funInspectRecord:print'" type="link" @click="onPrintRow([record.id])">
                打印
              </a-button>
              <a-button v-if="[StatusType.待提交, StatusType.未通过].includes(record.status)" v-permission="'funInspectRecord:submit'" type="link" @click="onSubmit(record)">
                提交审核
              </a-button>
              <a-button v-if="[StatusType.待提交, StatusType.填写中, StatusType.未通过].includes(record.status)" v-permission="'funInspectRecord:delete'" type="link" danger @click="onDel(record)">
                删除
              </a-button>
              <a-button v-if="[StatusType.审核中].includes(record.status)" v-permission="'funInspectRecord:revoke'" type="link" danger @click="onRevoke(record)">
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
        :process-type="ProcessType.EQUIPMENT_FUNCTION_CHECK"
        :label-col="{ style: { width: '100px' } }"
      />
    </a-modal>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { EquipmentFunCheckRecordEntity } from './EquipmentFunCheckRecordEntity'
import { GetRecordListParams, delCheck, exportRecord, getRecordList, revokePlan, submitCheck } from './api'
import Edit from './component/Edit.vue'
import PlanSelector from './component/PlanSelector.vue'
import EqSelector from './component/EqSelector.vue'
import { StatusType, StatusTypeDict } from './api.ts'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisCustomColumns, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { ProcessType } from '~/components/commonProcess'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import { getOrgComboTree } from '~/api/common.ts'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'
import { IlisPrintUdr, PrintUdrTempleteType } from '~/utils/IlisPrintUdr.ts'
import AddPlan from '~/views/equipment/funcationalInspect/plan/component/AddPlan.vue'

const ilisPrintUdr = new IlisPrintUdr()

const checkDate = ref<string[]>([])

const queryForm = ref(new GetRecordListParams())

const auditVisible = ref(false)

const exportLoading = ref(false)

const processLoading = ref(false)

const processFormRef = ref()

const checkLogsRef = ref()

const actionRow = ref()

const treeData = ref<IDepartmentEntity[]>([])

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
} = useTableHooks<EquipmentFunCheckRecordEntity>({
  api: getRecordList,
  customType: 'equipment_function_check',
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

getTreeData()

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

function handleMenuClick(node) {
  if (node.key === 'addByPlan') {
    AnyDialogHelper.showModel(PlanSelector).then(() => {
      getList()
    })
  }

  if (node.key === 'addCheck') {
    AnyDialogHelper.showModel(EqSelector).then(() => {
      getList()
    })
  }
}

function onSearch() {
  if (checkDate.value && checkDate.value[0] && checkDate.value[1]) {
    queryForm.value.checkStartDate = checkDate.value[0]
    queryForm.value.checkEndDate = checkDate.value[1]
  }
  else {
    queryForm.value.checkStartDate = undefined
    queryForm.value.checkEndDate = undefined
  }

  selectedRowKeys.value = []
  selectedRows.value = []
  handleSearch()
}

function onReset() {
  checkDate.value = []
  queryForm.value = new GetRecordListParams()
  onSearch()
}

async function onExport() {
  if (total.value === 0) {
    message.warn('没有可导出的数据！')
    return
  }

  exportLoading.value = true
  const res = await exportRecord(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '设备功能核查.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function formatCheckItems(rows) {
  return rows.map(i => i.name).join(';')
}

function onSubmit(record) {
  actionRow.value = record
  auditVisible.value = true
}

function onEdit(record) {
  AnyDialogHelper.showModel(Edit, {
    record,
  }).then(() => {
    getList()
  })
}

function onCheckDetail(record) {
  AnyDialogHelper.showModel(Edit, {
    record,
    isDetail: true,
  }).then(() => {
    getList()
  })
}

function onCheckPlanDetail(id) {
  AnyDialogHelper.showModel(AddPlan, {
    isDetail: true,
    record: {
      id,
    },
  })
}

function onBatchEdit() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要批量编辑的数据！')
    return
  }

  if (selectedRows.value.find(i => ![StatusType.填写中, StatusType.待提交, StatusType.未通过].includes(i.status))) {
    message.warn('【审核中】和【已通过】状态的数据不能编辑，请重新选择！')
    return
  }

  AnyDialogHelper.showModel(Edit, {
    ids: selectedRowKeys.value,
  }).then(() => {
    getList()
  })
}

async function onCheckLog(record) {
  checkLogsRef.value.open({
    objectType: LogType.设备功能核查,
    objectId: record.id,
    relationQry: true,
  })
}

function onDel(record) {
  Modal.confirm({
    title: '您正在删除设备功能核查记录！',
    content: '删除后将无法恢复，您确定要删除当前的设备功能核查记录吗？',
    onOk: async () => {
      await delCheck(record.id)
      message.success('删除成功！')
      getList()
    },
  })
}

function onRevoke(record: EquipmentFunCheckRecordEntity) {
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

async function handleSubmitProcess() {
  processLoading.value = true
  const data = await processFormRef.value.getProcessFormData()
  data.presetAuditors = data.presetAuditers
  data.processForm = data.formPropertyJson
  data.id = actionRow.value.id
  delete data.presetAuditers

  await submitCheck(data).finally(() => {
    processLoading.value = false
  })
  message.success('提交成功')
  getList()
  processLoading.value = false
  auditVisible.value = false
}

function onPrint() {
  if (selectedRows.value.length !== 1) {
    message.warn('请勾选单条数据进行打印！')
    return
  }

  const row = selectedRows.value[0]
  if (row.status !== StatusType.已完成) {
    message.warn('请选择状态为【已通过】的数据进行打印！')
    return
  }

  onPrintRow([row.id])
}

function onPrintRow(ids: string[]) {
  ilisPrintUdr.commonPrint(ids, PrintUdrTempleteType.核查记录打印)
}
</script>
