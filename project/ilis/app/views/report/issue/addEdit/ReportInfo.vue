<template>
  <div class="w-full overflow-hidden">
    <div v-if="!disabled && !issueId" class="flex justify-between mb-2">
      <a-space>
        <a-input
          v-model:value.trim="searchVal"
          allow-clear
          placeholder="输入报告编号查询"
          @keypress.enter="search"
        />
        <a-button type="primary" @click="search">
          查询
        </a-button>
        <a-button @click="reset">
          重置
        </a-button>
      </a-space>
      <ScanCodeQuery
        v-model:value="scanVal"
        placeholder="请在输入框中获取焦点后，扫描报告"
        class="!min-w-[300px]"
        :scan-type="SCAN_TYPE.REPORT_ISSUE"
        @enter="scanCodeResult"
      >
        <template #scan-btn="{ onScan }">
          <a-button class="ml-1" @click="onScan">
            <ScanOutlined />
          </a-button>
        </template>
      </ScanCodeQuery>
    </div>

    <IlisTable
      show-index
      :entity="ReportInfoEntity"
      :data-source="dataSource"
      :field-list="filedList"
      :pagination="issueId ? false : pagination"
      :table-width="1000"
    >
      <template #bodyCell="{ record, column, text }: any">
        <template v-if="column.dataIndex === 'mark'">
          <Mark :row-data="record" :tab-type="tabType" />
        </template>
        <template v-if="column.dataIndex === 'receiverSignature'">
          <img v-if="text" :src="text" class="w-10 h-8 object-contain img-border" />
          <span v-if="record.preReceiver">（{{ record.preReceiver }}）</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" size="small" danger @click="removeReport(record.reportId)">
            移除
          </a-button>
        </template>
      </template>
    </IlisTable>
  </div>
</template>

<script setup lang='ts'>
import type { ReportData, TabType } from '../listEntity'
import { ScanOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { SCAN_TYPE, ScanCodeQuery } from '~/components/scanCodeQuery'
import { modalError } from '~/views/consign/consignList/modules/modalUtil'
import Mark from '../components/Mark.vue'
import { ReportInfoEntity } from './addEditEntity'

const props = defineProps({
  issueId: { type: String, default: '' },
  reports: {
    type: Array as PropType<ReportData[]>,
    default: () => [],
  },
  tabType: {
    type: String as PropType<TabType>,
    default: '0',
  },
  disabled: Boolean,
  /** 控制参数：报告发放签字采用在线签字 */
  reportManage: Boolean,
})
const emit = defineEmits(['add', 'remove'])
const searchVal = ref('')
const scanVal = ref('')
const dataSource = ref(props.reports)
const filedList = computed(() => {
  const fileds = ReportInfoEntity.getTableFieldList()
  return (props.disabled || !!props.issueId) ? fileds.filter(d => d !== 'action') : fileds
})
const reportIdObj: any = {}
const pagination = ref({
  total: 0,
  pageSize: 5,
  current: 1,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  onChange: handlePageChange,
  pageSizeOptions: ['5', '10', '20', '50'],
})

watch(
  () => props.reports,
  (datas) => {
    queryReport()
    datas.forEach((d) => {
      reportIdObj[d.reportId] = 1
    })
  },
  {
    deep: true,
  },
)

function handlePageChange(page: number, pageSize: number) {
  pagination.value.current = page
  pagination.value.pageSize = pageSize
  queryReport()
}

/** 查询报告 */
function queryReport() {
  if (searchVal.value) {
    const val = searchVal.value.toLocaleLowerCase()
    dataSource.value = props.reports.filter((d) => {
      if (!d.reportNumber)
        return false
      const n = d.reportNumber.toLocaleLowerCase()
      return n.includes(val)
    })
  }
  else {
    dataSource.value = props.reports
  }
  const len = dataSource.value.length
  pagination.value.total = len
  const { current, pageSize } = pagination.value
  if (current > 1 && current > Math.ceil(len / pageSize)) {
    pagination.value.current--
  }
}

/** 搜索报告 */
function search() {
  pagination.value.current = 1
  queryReport()
}

/** 重置 */
function reset() {
  searchVal.value = ''
  search()
}

/** 扫码添加 */
function scanCodeResult(res: ReportData[]) {
  if (!res || res.length === 0) {
    message.error('系统中不存在该报告!')
    return
  }
  if (props.reportManage && props.reports.length > 0) {
    const one = res[0].consignPerson
    const isSame = props.reports[0].consignPerson === one
    if (!isSame) {
      modalError('当前报告委托人与已添加报告的委托人不一致，请重新添加！')
      return
    }
  }

  const addReports = []
  const repeat: string[] = []
  res.forEach((r) => {
    if (reportIdObj[r.reportId]) {
      repeat.push(r.reportNumber)
    }
    else {
      addReports.unshift(r)
    }
  })
  if (repeat.length > 0) {
    message.warn(`报告${repeat.join(', ')}已存在！`)
    return
  }
  if (addReports.length > 0) {
    searchVal.value = ''
    emit('add', res)
  }
}

/** 移除报告 */
function removeReport(reportId: string) {
  Modal.confirm({
    title: '移除报告',
    content: `确认移除该报告吗？`,
    okText: '确认',
    centered: true,
    onOk: () => {
      delete reportIdObj[reportId]
      emit('remove', reportId)
    },
  })
}
</script>

<style scoped>
.img-border{
  border: 1px solid #dcdfe6;
}
</style>
