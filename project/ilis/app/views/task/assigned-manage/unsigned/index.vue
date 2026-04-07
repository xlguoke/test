<template>
  <BaseSpinWrapper>
    <div class="flex items-center justify-between">
      <IlisFormSearch
        :entity="TaskUnAssignedManageEntity"
        show-industry
        :init-data="initSearchData"
        :hidden-fields="hiddenFields"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #quickQryParam="{ data }">
          <IlisInput
            v-model="data.quickQryParam"
            :entity="TaskUnAssignedManageEntity"
            :placeholder="quickSearchPlaceholder"
            :title="quickSearchPlaceholder"
            field="quickQryParam"
            class="!w-[260px]"
            @press-enter="nextTick(() => handleSearch(data))"
          />
        </template>
      </IlisFormSearch>
      <div>
        <a-checkbox
          v-model:checked="myDataOnly"
          @change="nextTick(() => handleSearch({
            ...lastSearchParams,
            myDataOnly,
          }))"
        >
          仅看本人收样
        </a-checkbox>
        <a-checkbox
          v-model:checked="checkOverdue"
          @change="nextTick(() => handleSearch({
            ...lastSearchParams,
            qryType: checkOverdue ? 'overdue' : 'common',
          }))"
        >
          查看超期数据
        </a-checkbox>
      </div>
    </div>
    <HtButtonGroup :show-count="8">
      <a-button v-if="assignTaskPermission" :icon="h(ShareAltOutlined)" @click="handleAssignTask(selectedRows)">
        分配任务
      </a-button>
      <a-button v-permission="'unAssignRollback'" :icon="h(RollbackOutlined)" @click="handleReturnTask(selectedRows).then(handleReloadTable)">
        退回
      </a-button>
      <a-button :icon="h(EditOutlined)" @click="handleSubpackageTask(selectedRows, handleReloadTable)">
        分包登记
      </a-button>
      <a-button v-permission="'inspection-notice'" :icon="h(PrinterOutlined)" @click="handlePrintTaskNotice(selectedRows)">
        打印检测工作通知单
      </a-button>
      <a-button
        v-permission="'allotTaskStatusMarker'"
        :icon="h(StarFilled)"
        @click="handleMark(selectedRows?.map(i => i.id), selectedRows?.length === 1 ? selectedRows[0]?.markObjectColorTextIds?.split(',') : []).then(handleReloadTable)"
      >
        标记
      </a-button>
      <a-button
        v-permission="'allotTaskStatusMarker'"
        :icon="h(StarOutlined)"
        @click="handleCancelMark(selectedRows?.map(i => i.id)).then(handleReloadTable)"
      >
        取消标记
      </a-button>
      <IlisCustomColumns type="column-task-unassigned" @confirm="handleReloadTable" />
    </HtButtonGroup>
    <a-alert
      class="cursor-pointer"
      type="warning" show-icon
      @click="checkOverdue = true; handleSearch({
        ...lastSearchParams,
        qryType: checkOverdue ? 'overdue' : 'common',
      })"
    >
      <template #message>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData.howLangToAge }}</span>
        <span>天内龄期到期：</span>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData.countPeriod }}</span>
        <span>条;&nbsp;&nbsp; 超出委托日期</span>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData.overDate }}</span>
        <span>天未分配：</span>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData.countNotAssign }}</span>
        <span>条</span>
      </template>
    </a-alert>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        resizable
        :custom-columns="customColumns"
        :entity="TaskUnAssignedManageEntity"
        :data-source="dataSource"
        :loading="loading"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :custom-row="getCustomRow((row: TaskUnAssignedManageEntity) => ({
          onDblclick: () => {
            selectedRows = [row]
            selectedRowKeys = [row.id]
            if (assignTaskPermission) {
              handleAssignTask([row])
            }
          },
        }))"
        :table-height="tableHeight"
        :table-width="600"
        :field-order="['status']"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <div class="flex flex-wrap gap-2 items-center">
              <IlisMarks v-if="getBusinessMark(record as TaskUnAssignedManageEntity)?.length" :marks="getBusinessMark(record as TaskUnAssignedManageEntity)" />
              <IlisCustomMark
                v-for="item in getMarkData(record.markObjectColorTextIds?.split(','))"
                :key="item.id"
                :data="item"
              ></IlisCustomMark>
            </div>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-button
              v-permission="'unAssignGoConsignInfo'"
              type="link"
              size="small"
              @click.stop="AnyDialogHelper.showModel(DetailVue, record)"
            >
              查看委托详情
            </a-button>
            <a-button
              v-permission="'assignedGoProcessLog'"
              type="link"
              size="small"
              @click.stop="AnyDialogHelper.showModel(LogModalByApi, {
                id: record.id,
                logType: '1',
                relationQry: true,
              })"
            >
              日志
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
  </BaseSpinWrapper>
</template>

<script setup lang='ts'>
import type { OverDueData } from './api'
import type { IlisMark } from '~/components/ilisComponent/marks/IlisMarks.vue'
import type { ICustomMark } from '~/interface/ICustomMark'
import { EditOutlined, PrinterOutlined, RollbackOutlined, ShareAltOutlined, StarFilled, StarOutlined } from '@ant-design/icons-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import HtButtonGroup from '~/components/htButtonGroup'
import { CustomMarkManagePage, CustomMarkRange, MarkTypeCode } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useIndustryStore } from '~/store/industryStore'
import { usePermissionStore } from '~/store/permissionStore.ts'
import { handlePrintTask, handlePrintTaskByMerge } from '../signed/composables/useBusinessFuntion'
import { TaskAssignedManageEntity } from '../signed/TaskAssignedManageEntity'
import { getOverdueMsg, getTaskAssignedManageList } from './api'
import { handleAssignTask, handlePrintTaskNotice, handleReturnTask, handleSubpackageTask } from './composables/useBusinessFuntion'
import DetailVue from './detail.vue'
import { TaskUnAssignedManageEntity } from './TaskUnAssignedManageEntity'

const myDataOnly = ref(false)

const checkOverdue = ref(false)

const overdueData = ref<OverDueData>({
  countNotAssign: 0,
  countPeriod: 0,
  howLangToAge: 0,
  overDate: 0,
})

const {
  canUseMarkList,
  handleMark,
  handleCancelMark,
} = useCustomMark({
  module: CustomMarkManagePage.MANAGE_TEST_PAGE,
  range: CustomMarkRange.ASSIGN,
  markType: MarkTypeCode.TASK,
})

const { hasPermission } = usePermissionStore()

// 任务分配权限
const assignTaskPermission = computed(() => {
  return hasPermission('goTaskAssign') && (hasPermission('taskAssignByObject') || hasPermission('taskAssignByParam'))
})

const {
  loading,
  dataSource,
  customColumns,
  selectedRows,
  selectedRowKeys,
  lastSearchParams,
  tableHeight,
  tableBoxRef,
  handleSearch,
  handleReset,
  getRowSelection,
  getPagination,
  getCustomRow,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<TaskUnAssignedManageEntity>({
  api: getTaskAssignedManageList,
  customType: 'column-task-unassigned',
  sizeKey: 'rows',
  responseDataTransform: async (res) => {
    // 这里利用一下responseDataTransform钩子的副作用去更新超期数据
    const { data } = await getOverdueMsg()
    overdueData.value = data.attributes
    // res?.rows.forEach((i) => {
    //   i.id = JSON.stringify(i)
    // })
    return res
  },
})

const { getField } = useIndustryStore()
const hiddenFields = computed(() => {
  const arr = []
  const industryProjectField = getField('project')
  if (!industryProjectField?.selected) {
    arr.push(...['projectName', 'projectCode', 'projectPrincipal', 'projectCreator'])
  }
  return arr
})

const initSearchData = ref(TaskUnAssignedManageEntity.fromJSON({ subcontract: false }))

const quickSearchPlaceholder = asyncComputed(async () => {
  const param = await getBusinessParam('FINISH_DELE_10') as unknown as string
  return param === 'taskRecordReport'
    ? '请输入委托编号/样品编号/报告编号/样品名称/工程部位/用途'
    : '请输入委托编号/样品编号/样品名称/工程部位/用途'
})

function getMarkData(markIds: string[]): ICustomMark[] {
  return canUseMarkList.value?.filter(i => markIds?.includes(i.id)) || []
}

function getBusinessMark(row: TaskUnAssignedManageEntity) {
  const mark: IlisMark[] = []
  if (row.status === '2') {
    mark.push({ mark: '退', description: '退回重新流转的样品', color: 'red', border: false })
  }
  if (row.ordernum === '1') {
    mark.push({ mark: '龄', description: '龄期即将到期', color: '#ffb935', border: false })
  }
  if (row.ordernum === '2') {
    mark.push({ mark: '龄', description: '龄期到期', color: '#ff5c80', border: false })
  }
  if (row.ordernum === '3') {
    mark.push({ mark: '龄', description: '龄期超期', color: '#red', border: false })
  }
  if (row.urgentStatus === '10') {
    mark.push({ mark: '急', description: '委托方要求加急检测', color: 'green' })
  }
  if (row.isSubcontract) {
    mark.push({ mark: '分', description: '分包', color: 'green', border: false })
  }
  return mark
}

/**
 * # 获取选中行
 * 暴露给分配任务页面使用（太难改了。。妥协兼容）😭
 */
function getSelectRows() {
  return selectedRows.value
}
window.getSelectRows = getSelectRows
window.rollbackCallBack = handleReloadTable

onMounted(async () => {
  // 挂载到top.window，让iframe中的JSP页面也能访问到
  window.top!.getSelectRows = getSelectRows
  /** # 分配完成后的回调 */
  window.top!.closeAssignWindow = () => {
    // message.success('操作成功')
    window?.top?.layer.closeAll()
    handleReloadTable()
  }

  /** # 分配后可能执行打印操作 */
  window.top!.printTaskSheetMerge = (ids: string[]) => handlePrintTaskByMerge(TaskAssignedManageEntity.fromJsonArray(ids.map(i => ({ testTaskId: i }))))
  window.top!.printTaskDistribution = (ids: string[]) => handlePrintTask(TaskAssignedManageEntity.fromJsonArray(ids.map(i => ({ testTaskId: i }))))
})
onUnmounted(() => {
  window.top!.closeAssignWindow = null
  window.top!.printTaskSheetMerge = null
  window.top!.printTaskDistribution = null
  window.top!.getSelectRows = null
})
</script>
