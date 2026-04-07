<template>
  <BaseSpinWrapper>
    <div class="flex justify-between items-center">
      <IlisFormSearch
        ref="formSearchRef"
        :entity="TaskReviewEntity"
        :init-data="initFormData"
        :hidden-fields="hiddenFields"
        show-industry
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <div>
        <div v-if="activeKey === '2'">
          <a-radio-group v-model:value="queryParams.queryScope" @change="handleRadioChange">
            <a-radio v-permission="'departManager'" value="user">
              待本人审核
            </a-radio>
            <a-radio v-permission="'departManager'" value="depart">
              本部门数据
            </a-radio>
            <a-radio v-permission="'superUserAuthority'" value="all">
              显示全部数据
            </a-radio>
          </a-radio-group>
        </div>
        <div v-else>
          <a-checkbox v-if="activeKey !== '2'" v-model:checked="showAllData" @change="handleShowAllData()">
            显示全部数据
          </a-checkbox>
        </div>
      </div>
    </div>
    <div v-if="activeKey === '2'" class="flex justify-between items-center">
      <HtButtonGroup>
        <a-button v-permission="'doTaskReview'" @click="goReviewComment('1', selectedRows, activeKey, handleReloadTable)">
          复核同意
        </a-button>
        <a-button v-permission="'doTaskReview'" @click="goReviewComment('0', selectedRows, activeKey, handleReloadTable)">
          复核不同意
        </a-button>
        <a-button
          v-permission="'allotTaskStatusMarker'" :icon="h(StarFilled)"
          @click="handleMark(selectedRows?.map(i => i.id), selectedRows?.length === 1 ? selectedRows[0]?.markObjectColorTextIds?.split(',') : []).then(handleReloadTable)"
        >
          标记
        </a-button>
        <a-button
          v-permission="'allotTaskStatusMarker'" :icon="h(StarOutlined)"
          @click="handleCancelMark(selectedRows?.map(i => i.id)).then(handleReloadTable)"
        >
          取消标记
        </a-button>
        <IlisCustomColumns
          :type="columnType"
          @confirm="handleReloadTable()"
        />
      </HtButtonGroup>
    </div>
    <div v-else>
      <IlisCustomColumns
        :type="columnType"
        @confirm="handleReloadTable()"
      />
    </div>
    <a-alert
      v-if="activeKey === '2'"
      class="cursor-pointer" type="warning" show-icon
      @click="checkOverdue = true; handleSearch({
        overDude: checkOverdue ? 'overDue' : '',
      })"
    >
      <template #message>
        <span>超出报告提交时间</span>
        <span class="text-red-500 text-[16px] font-bold p-1">{{ overdueData.day }}</span>
        <span>
          天未复核(
          <span class="text-red-500 text-[16px] font-bold">{{ overdueData.count }}</span>
          )！
        </span>
      </template>
    </a-alert>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        resizable
        :loading="loading"
        :data-source="dataSource"
        :entity="TaskReviewEntity"
        :table-height="tableHeight"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow((row: TaskReviewEntity) => ({
          onDblclick: () => {
            selectedRows = [row]
            selectedRowKeys = [row.id]
            detailsVerify(row, activeKey)
          },
        }))"
        :custom-columns="customColumns"
        :field-order="['_mark']"
        @change="handleSortChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === '_mark'">
            <div class="flex flex-wrap gap-2 items-center">
              <IlisMarks v-if="getBusinessMark(record as TaskReviewEntity)?.length" :marks="getBusinessMark(record as TaskReviewEntity)" />
              <IlisCustomMark
                v-for="item in getMarkData(record.markObjectColorTextIds?.split(','))"
                :key="item.id"
                :data="item"
              ></IlisCustomMark>
            </div>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-button v-permission="'taskReviewGoTaskDetail'" type="link" @click.stop="detailsVerify(record as TaskReviewEntity, activeKey)">
              详情
            </a-button>
            <a-button type="link" @click.stop="checkReviewApprovalOpinions(record as TaskReviewEntity)">
              复核审批意见
            </a-button>
            <a-button v-if="record.currentUserSign === 1" v-permission="'taskReviewGoTaskDetail'" type="link" @click.stop="goSign(record as any)">
              去签字
            </a-button>
            <a-button
              v-permission="'test-task-see-log'"
              type="link"
              @click.stop="AnyDialogHelper.showModel(LogModalByApi, {
                id: record.id,
                logType: '2',
                relationQry: true,
              })"
            >
              日志
            </a-button>
          </template>
        </template>
        <template #expandedRowRender="{ record }">
          <Sample
            :test-task-id="record.id"
            :test-object-id="record.testObjectId"
          />
        </template>
      </IlisTable>
    </div>
  </BaseSpinWrapper>
</template>

<script lang="ts" setup>
import type { OverDueData } from '../api.ts'
import type { IlisMark } from '~/components/ilisComponent/marks/IlisMarks.vue'
import type { ICustomMark } from '~/interface/ICustomMark.ts'
import { StarFilled, StarOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import HtButtonGroup from '~/components/htButtonGroup'
import { CustomMarkManagePage, CustomMarkRange, MarkTypeCode } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useIndustryStore } from '~/store/industryStore.ts'
import { getQryOverdueMsg, getWaitMeReviewList } from '../api.ts'
import ReviewApprovalOpinions from '../components/ReviewApprovalOpinions.vue'
import Sample from '../components/sample.vue'
import { TaskReviewEntity } from '../TaskReviewEntity'
import { detailsVerify, goReviewComment } from './composables/useBusinessunction.ts'

const props = defineProps({
  activeKey: {
    type: String,
    default: () => '1',
  },
  columnType: {
    type: String,
    default: () => 'column-review-confirm',
  },
})
const showAllData = ref(false)
const formSearchRef = ref()
const initFormData = new TaskReviewEntity()

const { getField } = useIndustryStore()
const hiddenFields = computed(() => {
  const arr = []
  const industryProjectField = getField('project')
  if (!industryProjectField?.selected) {
    arr.push(...['projectName', 'projectCode', 'projectPrincipal', 'projectCreator'])
  }
  return arr
})

// 监听高级查询弹窗打开事件，打开时才设置初始值
watch(() => formSearchRef.value?.advancedSearchVisible, (visible) => {
  if (visible) {
    initFormData.consignDateRange = [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  }
})
const queryParams = ref({
  queryScope: 'user',
  type: `${Number(props.activeKey)}`, // 2,3,4,5分别对应4个tab
})
const checkOverdue = ref(false)
const overdueData = ref<OverDueData>({
  day: 0,
  count: 0,
})

const {
  canUseMarkList,
  handleMark,
  handleCancelMark,
} = useCustomMark({
  module: CustomMarkManagePage.MANAGE_TEST_PAGE,
  range: CustomMarkRange.REVIEW,
  markType: MarkTypeCode.TASK,
})

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRows,
  selectedRowKeys,
  customColumns,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<TaskReviewEntity>({
  api: getWaitMeReviewList,
  customType: props.columnType,
  sizeKey: 'rows',
  query: queryParams,
  responseDataTransform: async (res) => {
    const { data } = await getQryOverdueMsg()
    overdueData.value = data.obj
    return res
  },
})
function getMarkData(markIds: string[]): ICustomMark[] {
  return canUseMarkList.value?.filter(i => markIds?.includes(i.id)) || []
}
function getBusinessMark(row: TaskReviewEntity) {
  const mark: IlisMark[] = []
  const statuasReportAll = '8,9,10'
  /**
   * 到期处理
   */
  if (row.agePeriod) {
    const agePeriodArr = row.agePeriod.split(',')
    for (let i = 0; i < agePeriodArr.length; i++) {
      const item = agePeriodArr[i]
      if (props.activeKey === '5') {
        if (!statuasReportAll.includes(row.reportStatus) || !item)
          continue
        if (item === '1') {
          mark.push({ mark: '龄', description: '即将到期', color: 'blue', border: false })
        }
        else if (item === '2') {
          mark.push({ mark: '龄', description: '已过期', color: '', border: false })
        }
        else if (item === '3') {
          mark.push({ mark: '龄', description: '已到期', color: 'green', border: false })
        }
      }
      else {
        if (item === '1') {
          mark.push({ mark: '龄', description: '即将到期', color: 'blue', border: false })
        }
        else if (item === '2') {
          mark.push({ mark: '龄', description: '已过期', color: '', border: false })
        }
        else if (item === '3') {
          mark.push({ mark: '龄', description: '已到期', color: 'green', border: false })
        }
      }
    }
  }
  /**
   * 任务，报告退回标记
   */
  if (props.activeKey === '5') { // 全部
    // 试验复核阶段，不会有任务退回的情况
    if (row.ordernum === 5 && statuasReportAll.includes(row.reportStatus)) {
      mark.push({ mark: '退', description: '有报告退回', color: 'red', border: false })
    }
  }
  else {
    if (row.reportBpmStatus && row.reportBpmStatus.includes('0')) {
      mark.push({ mark: '退', description: '有报告退回', color: 'red', border: false })
    }
  }
  /**
   * 显示报告最大状态签字 > 复核通过 > 代办
   */
  if (props.activeKey === '2' && row.currentUserSign === '1') {
    mark.push({ mark: '待签', description: '待当前流程人员签字', color: '#2a9cdf', border: false, bg: '#e4edeb' })
  }
  else if (props.activeKey === '2' && row.currentUserReviewTimes > 0) {
    mark.push({ mark: '复', description: '批', color: 'green', border: true })
  }
  else if (props.activeKey === '2' && row.waitMeReview === 1) {
    mark.push({ mark: '待办', description: '其他人已处理，待我处理', color: '#2a9cdf', border: false, bg: '#e4edeb' })
  }

  /**
   * 加急标记
   */
  if (row.urgentStatus === '10') {
    mark.push({ mark: '急', description: '委托方要求加急检测', color: 'green', border: true })
  }
  /**
   * 不合格标记
   */
  if (row.autoIsQualified === 0) {
    mark.push({ mark: '不合格', description: '不合格', color: 'red', border: false, bg: '#ffebeb' })
  }
  if (row.autoIsQualified === 3) {
    mark.push({ mark: '指标不合格', description: '有指标不合格', color: '#f1891a', border: false, bg: '#ffe3c1' })
  }
  return mark
}
// 去签字
function goSign(record: any) {
  window.sign.signFun(record.rid, 'review')
}
// 显示全部数据
function handleShowAllData() {
  const query = { ...queryParams.value }
  query.queryScope = showAllData.value ? 'all' : query.queryScope
  handleSearch(query)
}
// 待本人审核，本部门数，全部数据
function handleRadioChange(val: any) {
  // queryParams.value.queryScope = val.target.value
  const query = { ...queryParams.value }
  query.queryScope = val.target.value
  handleSearch(query)
}
// 查看复核审批意见
function checkReviewApprovalOpinions(record: TaskReviewEntity) {
  AnyDialogHelper.showModel(ReviewApprovalOpinions, { data: record, activeKey: props.activeKey })
}
</script>

<style lang="less" scoped>
.container {
  min-width: 300px; /* 最小宽度为 300px */
  max-width: 960px; /* 最大宽度为 960px */
  margin: 0 auto; /* 居中显示 */
  border: 1px solid #ccc;
}
</style>
