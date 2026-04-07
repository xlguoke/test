<template>
  <HtModal
    v-model:open="visible"
    title="新增用印登记"
    width="1400px"
    fixed-height
    :confirm-loading="loading"
    :after-close="onClosed"
    ok-text="导出"
    @ok="handleOk"
  >
    <div class=" flex flex-col h-full gap-3">
      <div class="flex justify-between">
        <a-space>
          <a-select
            v-model:value="searchVal"
            :options="options"
            allow-clear
            placeholder="请选择是否重复"
            class="w-64"
            @keypress.enter="search"
          >
          </a-select>
          <a-button type="primary" @click="search">
            查询
          </a-button>
          <a-button @click="reset">
            重置
          </a-button>
        </a-space>
        <a-space>
          <ScanCodeQuery
            v-model:value="scanVal"
            placeholder="请在输入框中获取焦点后，扫描报告"
            class="!min-w-[300px]"
            :scan-type="SCAN_TYPE.SEAL_REGISTER"
            @enter="scanCodeResult"
          >
            <template #scan-btn="{ onScan }">
              <a-button class="ml-1" @click="onScan">
                <ScanOutlined />
              </a-button>
            </template>
          </ScanCodeQuery>
        </a-space>
      </div>
      <a-space>
        <a-button @click="handleBatchRemove()">
          批量移除
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="reportId"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :table-height="tableHeight"
          :entity="ReportSealEntity"
          :pagination="pagination"
          :row-class-name="rowClassName"
          :field-list="tableFiledList"
          :row-selection="{ selectedRowKeys: checkedKeys, onChange: handleRowClick }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'repetitive'">
              <div class="flex">
                <span>{{ `${record.repetitive ? '是' : '否'}` }}</span>
                <a-tooltip v-if="record.repetitive" class="ml-1">
                  <template #title>
                    {{ `${record.lastRegisterTime}已经扫码登记过了` || '' }}
                  </template>
                  <QuestionCircleOutlined />
                </a-tooltip>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'generateQrCode'">
              <span>{{ `${record.generateQrCode ? '是' : '否'}` }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <a-button type="link" danger @click="handleRemove(record.reportId)">
                移除
              </a-button>
            </template>
            <template v-else-if="column.dataIndex === 'remark'">
              <span>{{ `${record.remar ? record.remark : ''}` }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'stamps'">
              {{ showStamps(record.stamps) }}
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { SelectProps } from 'ant-design-vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { QuestionCircleOutlined, ScanOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { SCAN_TYPE, ScanCodeQuery } from '~/components/scanCodeQuery'
import { useTableHeight } from '~/hooks/useTableHeight.ts'
import { saveAndExportReportSealList } from '../api'
import { ReportSealEntity } from '../reportSealEntity'

const props = defineProps<IDialogPropsParam<null, Record<string, any>>>()

const { tableBoxRef, tableHeight } = useTableHeight()

// 本次无需传递props
interface Stamp {
  sealId: string
  sealName: string
}

const dataSource = ref<ReportSealEntity[]>([])
const dataSourceBackup = ref([...dataSource.value])
const pagination = ref({ // 原生分页
  total: 0,
  pageSize: 5,
  current: 1,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  onChange: handlePageChange,
  pageSizeOptions: ['5', '10', '20', '50'],
})
const options = ref<SelectProps['options']>([
  { value: '1', label: '是' },
  { value: '0', label: '否' },
])
const tableFiledList = ReportSealEntity.getTableFieldList().filter((field) => {
  return field !== 'registerTime'
})
const loading = ref(false)
const visible = ref(true)
const checkedKeys = ref<string[]>([]) // 选中行Keys
const searchVal = ref(undefined)
const scanVal = ref('')

// 确认并导出全部数据
async function handleOk() {
  if (!dataSource.value?.length) {
    message.warn('没有可导出的报告！')
    return
  }
  loading.value = true
  await saveAndExportReportSealList(dataSource.value).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  props.onConfirm(null)
  visible.value = false
}
// 扫码添加
function scanCodeResult(r: ReportSealEntity) { // 扫码结果
  if (!r) {
    message.error('系统中不存在该报告!')
  }
  // 重复判断
  const isExist = dataSource.value.some((item: any) => item.reportId === r.reportId)
  if (isExist) {
    message.warn('该报告已存在！')
    return
  }
  dataSource.value.unshift(r)
  searchVal.value = undefined
  dataSourceBackup.value = [...dataSource.value] // 数据备份（全局静态）
  message.success('操作成功')
}
function handleRemove(reportId: string) { // 移除报告
  Modal.confirm({
    title: '移除报告',
    content: h('div', {}, '确认移除该报告吗？'),
    okText: '确认',
    centered: true,
    onOk: () => {
      // 新扫入的报告，id可能为null，无法使用id判断，而需使用reportId判断
      dataSource.value = dataSource.value.filter((item: any) => item.reportId !== reportId)
      dataSourceBackup.value = [...dataSource.value]
      checkedKeys.value = checkedKeys.value.filter(key => key !== reportId) // 从选中项中移除
      message.success('操作成功')
    },
  })
}
function handleBatchRemove() { // 批量移除报告
  if (checkedKeys.value.length > 0) {
    Modal.confirm({
      title: '移除报告',
      content: h('div', {}, `确认移除选中报告吗？`),
      okText: '确认',
      centered: true,
      onOk: () => {
        dataSource.value = dataSource.value.filter((item: any) => !checkedKeys.value.includes(item.reportId))
        dataSourceBackup.value = [...dataSource.value]
        checkedKeys.value = []
        message.success('操作成功')
      },
    })
  }
  else {
    message.warning('请选择要移除的报告！')
  }
}

function queryReport() {
  if (searchVal.value) {
    const val = searchVal.value === '1'
    dataSource.value = dataSourceBackup.value.filter((item: any) => item.repetitive === val)
  }
  else {
    return
  }
  // 判断筛选后的数据，调整分页信息
  const len = dataSource.value.length
  pagination.value.total = len
  const { current, pageSize } = pagination.value
  if (current > 1 && current > Math.ceil(len / pageSize)) {
    pagination.value.current--
  }
}
function handlePageChange(page: number, pageSize: number) {
  pagination.value.current = page
  pagination.value.pageSize = pageSize
  queryReport()
}
/** 搜索报告 */
function search() {
  pagination.value.current = 1
  queryReport()
}

function reset() { // 重置搜索条件
  searchVal.value = undefined
  dataSource.value = [...dataSourceBackup.value]
}
function handleRowClick(e: any) { // 当前选中行ids
  checkedKeys.value = e
}
function showStamps(list: Stamp[]) {
  return list?.map(item => item.sealName).join('、') || '--'
}
// 重复行高亮
function rowClassName(record: any) {
  let className = ''
  if (record.repetitive)
    className = 'table-yellow-stripe'
  return className
}
</script>

<style lang="less" scoped>
// .table-yellow-stripe {
//   background-color: #FFF0DF; /* 浅黄色背景 */
// }
/* 为重复行添加黄色背景 */
:deep(.table-yellow-stripe) {
  background-color: #FFF0DF !important;
}
:deep(.table-yellow-stripe:hover > td) {
  background-color: #FFF0DF !important;
}
:deep(.table-yellow-stripe td.ant-table-cell-fix-right) {
  background-color: #ffffff !important;
}

:deep(.table-yellow-stripe:hover td.ant-table-cell-fix-right) {
  background-color: #ffffff !important;
}
</style>
