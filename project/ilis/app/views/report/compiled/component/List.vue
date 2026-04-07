<template>
  <div class=" h-full flex flex-col gap-3">
    <IlisFormSearch
      :entity="ReportCompiledEntity"
      @reset="handleReset"
      @search=" handleSearch({
        ...$event,
        overDue: '',
      })"
    ></IlisFormSearch>
    <a-space v-if="reportStatus === EReportCompiledStatus.COMPILE">
      <a-button v-permission="'createReport'" type="primary" @click="handleCreate">
        创建报告
      </a-button>
      <a-button
        v-permission="'createReportTaskStatusMarker'"
        @click="handleMark(selectedRows?.map(i => i.id), selectedRows?.length === 1 ? selectedRows[0]?.markObjectColorTextIds?.split(',') : []).then(handleReloadTable)"
      >
        标记
      </a-button>
      <a-button
        v-permission="'createReportTaskStatusMarker'"
        @click="handleCancelMark(selectedRows?.map(i => i.id)).then(handleReloadTable)"
      >
        取消标记
      </a-button>
    </a-space>
    <a-alert
      v-if="reportStatus === EReportCompiledStatus.COMPILE"
      class="cursor-pointer"
      type="warning" show-icon
    >
      <template #message>
        <span>超出报告创建日期</span>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData?.day }}</span>
        <span>天未提交：</span>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData?.count }}</span>
        <span>份</span>
        <span
          class="text-colorPrimary cursor-pointer ml-3 " @click="handleSearch({
            ...lastSearchParams,
            overDue: 'overdue',
          })"
        >
          <span class="mr-1">
            点击查询
          </span>
          <DoubleRightOutlined style="color: var(--colorPrimary)" />
        </span>
      </template>
    </a-alert>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        resizable
        table-width="1000"
        :loading="loading"
        :data-source="dataSource"
        :entity="ReportCompiledEntity"
        :table-height="tableHeight"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :field-list="fieldList"
        :custom-row="getCustomRow((row) => ({
          onDblclick: () => (hasPermission('viewReport') ? handleDetail(row) : message.warning('请设置权限')),
        }))"
        @change="handleSortChange"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'operation'">
            <span class="mr-2">操作</span>
            <a-tooltip title="检测报告请相关人员移步试验检测模块进行修改等处理">
              <QuestionCircleOutlined />
            </a-tooltip>
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'tipsIcon'">
            <div class="flex flex-wrap gap-2 items-center">
              <IlisMarks :marks="initMarks(record as ReportCompiledEntity)" />
              <IlisCustomMark
                v-for="item in getMarkData(record.markObjectColorTextIds?.split(','))"
                :key="item.id"
                :data="item"
              ></IlisCustomMark>
            </div>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <IlisTableAction
              :row="record"
              :options="options"
            ></IlisTableAction>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { OverdueReportData } from '../api'
import type { ICustomMark } from '~/interface/ICustomMark'
import type { ITableAction, ITableActionItem } from '~/interface/ITableActionItem'
import { DoubleRightOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { CustomMarkManagePage, CustomMarkRange, MarkTypeCode } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { usePermissionStore } from '~/store/permissionStore'
import { checkEditPermission, deleteReportCompiled, getOverdueReportData, getReportCompiledList } from '../api'
import {
  checkReportType,
  handleAddTemp,
  handleCancelInvalid,
  handleChangeReportSn,
  handleCreate,
  handleDetail,
  handleEdit,
  handleInvalid,
  showEditPermissionWarningModal,
  showEditWarningModal,
} from '../composables/useCompiledReport'
import { EReportCompiledStatus, EReportCompiledType, ReportCompiledEntity } from '../ReportCompiledEntity'

const props = defineProps<{
  reportStatus: EReportCompiledStatus
  currentKey: EReportCompiledStatus
}>()

const { hasPermission } = usePermissionStore()

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRows,
  lastSearchParams,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleDelete,
  handleSortChange,
  handleReloadTable,
} = useTableHooks<ReportCompiledEntity>({
  api: getReportCompiledList,
  delApi: deleteReportCompiled,
  payload: {
    reportStatus: props.reportStatus,
  },
  sizeKey: 'rows',
  beforeDelete: async (deleteArr: ReportCompiledEntity[]) => {
    const typeCheck = deleteArr.every(i => checkReportType(i))
    if (!typeCheck) {
      showEditWarningModal()
      return false
    }
    const permissionCheck = await Promise.all(deleteArr.map(async i => checkEditPermission(i)))
    if (!permissionCheck.every(i => i)) {
      showEditPermissionWarningModal()
      return false
    }
    return true
  },
  responseDataTransform: (res) => {
    // 利用一下副作用，在获取到数据后，再获取超期报告数据
    getOverdueReport()
    return res
  },
})

watch(() => props.currentKey, (val) => {
  if (val === props.reportStatus) {
    handleReloadTable()
  }
})

const {
  canUseMarkList,
  handleMark,
  handleCancelMark,
} = useCustomMark({
  module: CustomMarkManagePage.MANAGE_REPORT_PAGE,
  range: CustomMarkRange.EDIT,
  markType: MarkTypeCode.REPORT,
})

const edit: ITableActionItem<ReportCompiledEntity> = {
  label: '编辑',
  permissions: ['editReport'],
  fn: handleEdit,
  visible(record) {
    return checkReportType(record)
  },
}
const deleteItem: ITableActionItem<ReportCompiledEntity> = {
  label: '删除',
  permissions: ['deleteSynthesisReport'],
  fn: row => handleDelete([row]),
  danger: true,
  visible(record) {
    return checkReportType(record)
  },
}
const detail: ITableActionItem<ReportCompiledEntity> = {
  label: '详情',
  permissions: ['viewReport'],
  fn: handleDetail,
}
const editSn: ITableActionItem<ReportCompiledEntity> = {
  label: '修改报告编号',
  permissions: ['modifyReportSn'],
  fn: async (row) => {
    await handleChangeReportSn(row)
    handleReloadTable()
  },
  visible(record) {
    return checkReportType(record)
  },
}
const invalid: ITableActionItem<ReportCompiledEntity> = {
  label: '作废',
  permissions: ['discardReport'],
  fn: async (row) => {
    await handleInvalid(row)
    handleReloadTable()
  },
  visible(record) {
    return checkReportType(record)
  },
}
const cancelInvalid: ITableActionItem<ReportCompiledEntity> = {
  label: '取消作废',
  permissions: ['recoverReport'],
  fn: async (row) => {
    await handleCancelInvalid(row, handleReloadTable)
  },
  visible(record) {
    return checkReportType(record)
  },
}
const addTemp: ITableActionItem<ReportCompiledEntity> = {
  label: '添加临时报告',
  permissions: ['createTempReport'],
  fn: handleAddTemp,
  visible(record) {
    return record.reportType === EReportCompiledType.SYNTHESIS
  },
}

const options = computed<ITableAction<ReportCompiledEntity>>(() => {
  if (props.reportStatus === EReportCompiledStatus.COMPILE) {
    return [edit, deleteItem, detail, editSn, invalid, addTemp]
  }
  if (props.reportStatus === EReportCompiledStatus.AUDIT) {
    return [detail]
  }
  if (props.reportStatus === EReportCompiledStatus.APPROVED) {
    return [detail]
  }
  if (props.reportStatus === EReportCompiledStatus.INVALID) {
    return [deleteItem, detail, cancelInvalid]
  }
  return []
})

const fieldList = computed(() => {
  const allFields = ReportCompiledEntity.getTableFieldList()
  if (props.reportStatus === EReportCompiledStatus.COMPILE) {
    return allFields?.filter(i => !['submitDate'].includes(i)) || []
  }
  if (props.reportStatus === EReportCompiledStatus.AUDIT) {
    return allFields
  }
  if (props.reportStatus === EReportCompiledStatus.APPROVED) {
    return allFields?.filter(i => !['tipsIcon'].includes(i)) || []
  }
  if (props.reportStatus === EReportCompiledStatus.INVALID) {
    return allFields?.filter(i => !['submitDate', 'tipsIcon'].includes(i)) || []
  }
  return []
})

const overdueData = ref<OverdueReportData>()

async function getOverdueReport() {
  const { data } = await getOverdueReportData()
  overdueData.value = data?.obj
}

function initMarks(record: ReportCompiledEntity) {
  const marks = []
  if (record.tipsIcon?.includes('back')) {
    marks.push({ mark: '退', description: '报告退回', color: 'red', border: false })
  }
  if (record.tipsIcon?.includes('modify')) {
    marks.push({ mark: '改', description: '本报告需修改', color: 'blue', border: false })
  }
  return marks
}

function getMarkData(markIds: string[]): ICustomMark[] {
  return canUseMarkList.value?.filter(i => markIds?.includes(i.id)) || []
}
</script>
