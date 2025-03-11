<template>
  <ht-modal
    v-model:open="visible"
    title="引用系统查新结果"
    width="80%"
  >
    <div class="h-[80vh] flex flex-col gap-2">
      <a-alert type="info" show-icon>
        <template #message>
          <div>1.同步系统查新信息时，只能选择系统规程且设置为本单位规程的查新数据；</div>
          <div>2.若选择同一本规程的多次查新记录时，只会同步查新时间最新的一条；</div>
          <div>3.列表中名称高亮显示的规程为当前查新中已引用的规程，选择同步更新后，将会覆盖原登记的查新信息，请谨慎；</div>
        </template>
      </a-alert>
      <ilis-form-search
        :entity="CheckNewResultEntity"
        @reset="handleReset"
        @search="customHandleSearch"
      />
      <a-space>
        <a-button :loading="syncLoading" @click="syncQueryRecord">
          <SyncOutlined />同步查新记录
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <ilis-table
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :table-height="tableHeight"
          :entity="CheckNewResultEntity"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column, record, text, index }">
            <span :class="`${record.repeated ? 'text-orange-400' : ''}`">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                {{ CHECKNEW_RECORD_STATUS_DICT.getLabelByKey(text) }}
              </template>
              <template v-else-if="column.dataIndex === 'standardType'">
                {{ STANDARD_TYPE_DICT.getLabelByKey(text) }}
              </template>
              <template v-else>
                {{ text }}
              </template>
            </span>
          </template>
        </ilis-table>
      </div>
    </div>
    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button
        type="primary"
        :loading="loading1"
        :disabled="loading2"
        @click="saveQueryResult"
      >
        引用查询结果规程
      </a-button>
      <a-button
        type="primary"
        :loading="loading2"
        :disabled="loading1"
        @click="saveSelResult"
      >
        引用选中规程
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { CheckCircleFilled, SyncOutlined } from '@ant-design/icons-vue'
import { createVNode } from 'vue'
import { pullCheckNewRecord, quoteQueryResultHitekCenterApi, quoteSelResultApi, waitCheckNewStandardListHitekCenter } from '../../api'
import { DATA_FROM, STANDARD_TYPE_DICT } from '../waitCheckNewStandard'
import { CHECKNEW_RECORD_STATUS_DICT, CheckNewResultEntity } from '.'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface PropsParam {
  checkNewId: string
  onConfirm: () => void
}

const props = defineProps<IDialogPropsParam<null, PropsParam>>()

const visible = ref(true)
const loading1 = ref(false)
const loading2 = ref(false)

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRowKeys,
  lastSearchParams,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<CheckNewResultEntity>({
  api: waitCheckNewStandardListHitekCenter,
  totalKey: 'count',
  payload: {
    standardCheckNewId: props.param.checkNewId,
  },
  responseDataTransform: (res) => {
    res.rows.forEach((item: CheckNewResultEntity) => {
      item.standardType = `${item.standardType}`
    })
    return res
  },
})

/** 查询 */
function customHandleSearch(query: any) {
  const q = { ...query }
  // 执行日期
  if (q.searchExecuteDate && q.searchExecuteDate.length) {
    q.newStandardExecuteStartDate = q.searchExecuteDate[0]
    q.newStandardExecuteEndDate = q.searchExecuteDate[1]
    delete q.searchExecuteDate
  }
  else {
    q.newStandardExecuteStartDate = q.newStandardExecuteEndDate = undefined
  }
  // 查新日期
  if (q.searchCheckDate && q.searchCheckDate.length) {
    q.checkStartDate = q.searchCheckDate[0]
    q.checkEndDate = q.searchCheckDate[1]
    delete q.searchCheckDate
  }
  else {
    q.checkStartDate = q.checkEndDate = undefined
  }
  handleSearch(q)
}

/** 引用数据中心查询结果规程 */
async function saveQueryResult() {
  loading1.value = true
  await quoteQueryResultHitekCenterApi(lastSearchParams.value)
    .finally(() => loading1.value = false)
  props.onConfirm(null)
  message.success('操作成功')
  visible.value = false
}

/** 引用选中规程 */
async function saveSelResult() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择规程')
    return
  }
  loading2.value = true
  await quoteSelResultApi(DATA_FROM.D_CENTER, selectedRowKeys.value, props.param.checkNewId)
    .finally(() => loading2.value = false)

  props.param.onConfirm()

  Modal.confirm({
    title: '添加成功',
    icon: createVNode(CheckCircleFilled, { style: { color: '#52c41a' } }),
    content: '是否继续添加其他规程？',
    centered: true,
    okText: '确定',
    onOk: () => {
      selectedRowKeys.value = []
      handleReset()
    },
    onCancel: () => {
      visible.value = false
    },
  })
}

function cancel() {
  visible.value = false
}

/**
 * 同步查新记录
 */
const syncLoading = ref(false)
async function syncQueryRecord() {
  syncLoading.value = true
  try {
    await pullCheckNewRecord()
    message.success('同步成功')
    handleSearch()
  }
  finally {
    syncLoading.value = false
  }
}
</script>

<style>

</style>
