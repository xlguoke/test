<template>
  <ht-modal
    v-model:open="visible"
    title="复核审批意见"
    width="800px"
  >
    <IlisTable
      row-key="reportId"
      bordered
      :data-source="dataSource"
      :loading="loading"
      :entity="ReviewApprovalOpinionsEntity"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <span v-if="record.status === '1'" style="display: inline-block;background: #4CAF50;color: #fff;padding: 2px 8px;border-radius: 4px;">已修正</span>
          <span v-else style="display: inline-block;background: #ff0000;color: #fff;padding: 2px 8px;border-radius: 4px;">未修正</span>
        </template>
      </template>
    </IlisTable>
    <template #footer>
      <a-space v-if="dataSource.length">
        <a-button v-if="isShowGoHandleBtn" type="primary">
          前往处理
        </a-button>
        <a-button v-else type="primary" @click="detailsVerify(param.data, param.activeKey)">
          查看详情
        </a-button>
      </a-space>
      <a-button class="ml-2" @click="visible = false">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { ReviewApprovalQueryParams } from '../api'
import type { TaskReviewEntity } from '../TaskReviewEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getReviewApprovalOpinionsData } from '../api'
import { ReviewApprovalOpinionsEntity } from '../ReviewApprovalOpinionsEntity'
import { detailsVerify } from '../waitMeReview/composables/useBusinessunction'

interface IProps {
  data: TaskReviewEntity // 实体数据
  isTestTaskPage: boolean // 兼容其他功能模块的参数
  activeKey: string // 当前的tabIndex
}
const props = defineProps<IDialogPropsParam<null, IProps>>()

// 试验检测页面查看复核审批意见时，有数据，且存在未修正的数据显示前往处理按钮
// 试验检测页面查看复核审批意见时，有数据，且都是已修正的数据显示查看详情按钮
// 非试验检测页面查看复核审批意见时，有数据，显示查看详情按钮

const visible = ref(true)

// 父组件传递数据
const testTaskId = props.param.data.id || '' // 检测任务id
const reportId = props.param.data.rid || '' // 报告id
const isTestTaskPage = props.param.isTestTaskPage || false

// 列表查询参数
const queryParams = ref<ReviewApprovalQueryParams>({
  testTaskId,
  reportId,
  sourceModule: '',
  page: -1,
  size: -1,
})

const {
  dataSource,
  loading,
} = useTableHooks<ReviewApprovalOpinionsEntity>({
  api: getReviewApprovalOpinionsData,
  query: queryParams,
  responseDataTransform: (res) => {
    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

// 检查是否存在未修正的数据 -> 是否显示处理按钮
const isShowGoHandleBtn = computed(() => {
  if (isTestTaskPage) {
    const rows = dataSource.value
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].status !== '1') {
        return true
      }
    }
  }
  return false
})
</script>

<style scoped lang="less">
</style>
