<template>
  <BaseSpinWrapper>
    <div class="flex items-center justify-between">
      <IlisFormSearch
        :entity="TaskAssignedManageEntity"
        :init-data="initSearch"
        :hidden-fields="hiddenFields"
        show-industry
        @search="preHandleSearch"
        @reset="handleReset"
      >
      </IlisFormSearch>
      <div>
        <a-checkbox
          v-model:checked="showAll"
          @change="nextTick(() => handleSearch())"
        >
          显示全部检测部门的任务
        </a-checkbox>
      </div>
    </div>
    <HtButtonGroup :show-count="8">
      <a-button v-permission="'assignedListPrint'" :icon="h(PrinterOutlined)" @click="handlePrintTask(selectedRows)">
        打印任务分配单
      </a-button>
      <a-button v-permission="'print-task-sheet-merge'" :icon="h(PrinterOutlined)" @click="handlePrintTaskByMerge(selectedRows)">
        打印任务分配单（合并为一个单据）
      </a-button>
      <a-button v-permission="'inspection-notice'" :icon="h(PrinterOutlined)" @click="handlePrintTaskNotice(selectedRows)">
        打印检测工作通知单
      </a-button>
      <a-button v-permission="'assignedTaskExport'" :icon="h(ExportOutlined)" :loading="exporLoading" @click="handleExport()">
        导出
      </a-button>
      <IlisCustomColumns type="column-task-assigned" @confirm="handleReloadTable" />
      <a-button v-permission="'assignedReAssignTask'" :icon="h(SettingOutlined)" @click="handleBatchReallocate(selectedRows, handleReloadTable)">
        批量重新分配
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
    </HtButtonGroup>
    <div
      ref="tableBoxRef" class="flex-1 h-0"
      @mousemove="handleMoveInTable"
    >
      <IlisTable
        row-key="id"
        resizable
        :custom-columns="customColumns"
        :entity="TaskAssignedManageEntity"
        :data-source="dataSource"
        :loading="loading"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :custom-row="getCustomRow((row: TaskAssignedManageEntity) => ({
          onDblclick: () => {
            AnyDialogHelper.showModel(DetailVue, row)
          },
          onMouseenter: (_e: Event) => handleMouseenter(_e, row),
          onMouseleave: (_e: Event) => handleMouseleave(_e, row),
        }))"
        :table-height="tableHeight"
        :field-order="['_mark']"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === '_mark'">
            <div class="flex flex-wrap gap-2 items-center">
              <IlisMarks v-if="getBusinessMark(record as TaskAssignedManageEntity)?.length" :marks="getBusinessMark(record as TaskAssignedManageEntity)" />
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
              查看详情
            </a-button>
            <a-button
              v-permission="'assignedGoProcessLog'"
              type="link"
              size="small"
              @click.stop="AnyDialogHelper.showModel(LogModalByApi, {
                id: record.id,
                logType: '2',
                relationQry: true,
              })"
            >
              日志
            </a-button>
            <a-button
              v-permission="'assignedReAssignTask'"
              type="link"
              size="small"
              @click.stop="handleReAssignTask(record as TaskAssignedManageEntity, handleReloadTable)"
            >
              重新分配
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
    <div
      v-if="showPop"
      ref="popRef"
      class="fixed z-10 transition-all p-3 rounded-md bg-white shadow-md pointer-events-none"
      :style="{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
      }"
    >
      <div v-for="(item, key) in popData" :key="key">
        <span>{{ key }}：</span>
        <span>{{ item }}</span>
      </div>
    </div>
  </BaseSpinWrapper>
</template>

<script setup lang='ts'>
import type { IlisMark } from '~/components/ilisComponent/marks/IlisMarks.vue'
import type { ICustomMark } from '~/interface/ICustomMark'
import { ExportOutlined, PrinterOutlined, SettingOutlined, StarFilled, StarOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import HtButtonGroup from '~/components/htButtonGroup'
import { CustomMarkManagePage, CustomMarkRange, MarkTypeCode } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useIndustryStore } from '~/store/industryStore'
import { userStore } from '~/store/userStore'
import { getTaskAssignedManageList } from './api'
import {
  exportXls,
  handleBatchReallocate,
  handlePrintTask,
  handlePrintTaskByMerge,
  handlePrintTaskNotice,
  handleReAssignTask,
} from './composables/useBusinessFuntion'
import DetailVue from './detail.vue'
import { TaskAssignedManageEntity } from './TaskAssignedManageEntity'

const showAll = ref(true)

const {
  canUseMarkList,
  handleMark,
  handleCancelMark,
} = useCustomMark({
  module: CustomMarkManagePage.MANAGE_TEST_PAGE,
  range: CustomMarkRange.ASSIGN,
  markType: MarkTypeCode.TASK,
})

const {
  loading,
  dataSource,
  customColumns,
  selectedRows,
  lastSearchParams,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getRowSelection,
  getPagination,
  getCustomRow,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<TaskAssignedManageEntity>({
  api: getTaskAssignedManageList,
  customType: 'column-task-assigned',
  sizeKey: 'rows',
  immediate: false,
  responseDataTransform(res) {
    // 数据没主键，暂时用testTaskId作为主键（选取等逻辑需要唯一key）
    res?.rows?.forEach((i: TaskAssignedManageEntity) => {
      i.id = i.testTaskId || ''
    })
    return res
  },
  beforeSearch(params) {
    return {
      ...params,
      showAll: showAll.value,
    }
  },
})

const { getField } = useIndustryStore()
const hiddenFields = computed(() => {
  const arr = []
  const industryProjectField = getField('project')

  if (!industryProjectField?.selected) {
    arr.push(...['projectNames', 'projectCode', 'projectPrincipal', 'projectCreator'])
  }
  return arr
})

const { userInfo } = storeToRefs(userStore())

const initSearch = ref(TaskAssignedManageEntity.fromJSON({
  // 范围一个月
  consignDateSearch: [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
  assignerIds: userInfo.value.userId,
  assignerName: userInfo.value.realName,
}))

const exporLoading = ref(false)

const popRef = ref<HTMLDivElement>()

const currentRow = ref<TaskAssignedManageEntity>()

// 控制popRef的显示状态
const showPop = ref(false)

const popData = computed(() => {
  return {
    报告编写: currentRow.value?.reportEditor,
    复核: currentRow.value?.reviewUser,
    审核: currentRow.value?.checkerUser,
    批准: currentRow.value?.approverUser,
    规格型号: currentRow.value?.standard,
    委托编号: currentRow.value?.consignCode,
    委托单位: currentRow.value?.consignUnitName,
    委托日期: currentRow.value?.consignDate ? dayjs(currentRow.value?.consignDate).format('YYYY-MM-DD') : '-',
    检测参数: currentRow.value?.parameters,
  }
})

// 存储最新的鼠标位置
const mousePosition = ref({ x: 0, y: 0 })

const timer = ref()

function handleMouseenter(_e: Event, row: TaskAssignedManageEntity) {
  currentRow.value = row
  clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    showPop.value = true
  }, 300)
}

function handleMouseleave(_e: Event, _row: TaskAssignedManageEntity) {
  clearTimeout(timer.value)
  showPop.value = false
}

/**
 * 处理表格内的鼠标移动事件
 * 使用requestAnimationFrame优化元素位置更新，确保动画更丝滑
 * @param e 鼠标事件对象
 */
function handleMoveInTable(e: MouseEvent) {
  // 只更新位置信息，不直接操作DOM
  const { clientX, clientY } = e
  mousePosition.value = {
    x: clientX < 0 ? 0 : clientX,
    y: clientY < 0 ? 0 : clientY,
  }
}

async function handleExport() {
  exporLoading.value = true
  await exportXls(lastSearchParams.value).finally(() => {
    exporLoading.value = false
  })
}

function preHandleSearch(data: any) {
  if (!data.qryPersonName) {
    data.qryPerson = ''
  }
  if (!data.assignerName) {
    data.assignerIds = ''
  }
  handleSearch(data)
}

function getMarkData(markIds: string[]): ICustomMark[] {
  return canUseMarkList.value?.filter(i => markIds?.includes(i.id)) || []
}

function getBusinessMark(row: TaskAssignedManageEntity) {
  const mark: IlisMark[] = []
  if (row.urgentStatus === '10') {
    mark.push({ mark: '急', description: '委托方要求加急检测', color: 'green' })
  }
  return mark
}
</script>
