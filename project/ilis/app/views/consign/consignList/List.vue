<template>
  <div class="w-full h-full">
    <BaseSpinWrapper :spinning="loading || handleLoading" overflow-hidden>
      <IlisFormSearch
        :entity="ConsignListEntity"
        show-search-tag
        show-industry
        :init-data="initQuery"
        :hidden-fields="hiddenFields"
        @reset="handleReset"
        @search="customSearch"
      />

      <HtButtonGroup>
        <a-button v-permission="'goConsignInfoPage'" type="primary" @click="handleAdd">
          新增委托
        </a-button>
        <a-button v-permission="'completeConsignById'" @click="handleComplete">
          完成委托
        </a-button>
        <a-button v-permission="'consignCopy'" @click="handleCopy">
          复制委托
        </a-button>
        <a-button v-permission="'consign::signature'" @click="handleSign">
          委托方签字
        </a-button>
        <!-- 打印 -->
        <HandlePrint v-permission="'consignCommonPrint'" :selected-rows="selectedRows" :json-params="lastSearchParams" />
        <!-- 自定义属性 -->
        <CustomAttribute
          v-permission="'consign::customattribute'"
          customize-type="consign-property"
          :columns-type="ConsignCustomColumn.CONSIGN_INFO"
          show-blind-col
          show-pre-consign-col
        />
        <a-button v-permission="'changeContract'" @click="handleChangeContract">
          变更合同
        </a-button>
        <a-button v-permission="'consign::recreate::consignbill'" @click="handleCreateConsignBill">
          重新生成委托单
        </a-button>
        <a-button v-permission="'delAndRecoverConsign'" danger @click="handleVoid">
          作废/恢复委托
        </a-button>
        <a-button v-permission="'revocationConsign'" danger @click="handleWithdraw">
          撤回委托
        </a-button>
        <a-button v-permission="'deleteConsign'" danger @click="handleDelete">
          删除委托
        </a-button>
        <!-- 列筛选 -->
        <IlisCustomColumns
          :type="customColumnType"
          @confirm="confirmCustomColumns"
        >
          <template #default="{ open }">
            <a-dropdown>
              <template #overlay>
                <a-menu @click="(key: any) => openCustomColumns(key, open)">
                  <a-menu-item v-for="col in consignCustomColumnDict" :key="(col.key as string)">
                    {{ col.label }}
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                列筛选
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </template>
        </IlisCustomColumns>
        <!-- 导出：控制台报警告，非顶级元素，故在组件外套一层 -->
        <div v-permission="'exportConsignInfo'">
          <a-dropdown>
            <template #overlay>
              <a-menu @click="(e:any) => handleExport(`${e.key}`, lastSearchParams)">
                <a-menu-item v-for="d in exportList" :key="d.key">
                  {{ d.title }}
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              导出
              <DownOutlined />
            </a-button>
          </a-dropdown>
        </div>
      </HtButtonGroup>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :entity="ConsignListEntity"
          :data-source="dataSource"
          :custom-columns="customColumns"
          :table-height="tableHeight"
          :field-order="['mark', 'consignCode']"
          :custom-row="getCustomRow(customRowConfig)"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          resizable
          @change="handleSortChange"
        >
          <template #expandedRowRender="{ record }">
            <ListSamples :consign-id="record.id" :custom-columns="customSampleColumns" />
          </template>
          <template #bodyCell="{ column, record }">
            <!-- 标记 -->
            <template v-if="column.dataIndex === 'mark'">
              <IlisMarks :marks="initMarks(record as ConsignListEntity)" />
            </template>
            <!-- 签名状态 -->
            <template v-else-if="column.dataIndex === 'signStatus'">
              <SignStatus :status="record.signStatus" />
            </template>
            <!-- 备注 -->
            <template v-else-if="column.dataIndex === 'remark'">
              <div class="remark-textarea" @click.stop="() => {}">
                <textarea
                  :value="record.remark"
                  class="h-full w-full px-1 rounded-[2px] resize-none"
                  @blur="(e: any) => handleSaveRemark(record as ConsignListEntity, e.target.value)"
                />
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <a-button
                v-permission="'goConsignInfoPage'"
                type="link"
                @click.stop="handleDetail(record as ConsignListEntity)"
              >
                详情
              </a-button>
              <a-button
                v-if="isShowEdit(record.consignStatus, record.isDelete)"
                v-permission="'goConsignInfoPage'"
                type="link"
                @click.stop="handleEdit(record as ConsignListEntity)"
              >
                编辑
              </a-button>
              <a-button
                v-permission="'consignViewLog'"
                type="link"
                @click.stop="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '0', relationQry: true })"
              >
                日志
              </a-button>
              <a-button
                v-if="record.consignStatus === CONSIGN_STATUS.FINISH && record.isDelete !== 1"
                type="link"
                @click.stop="AnyDialogHelper.showModel(SeeSign, { consignId: record.id })"
              >
                查看签名
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>

    <!-- 委托方签名 -->
    <OnlineSginatureModal ref="onlineSginatureRef" @confirm="handleSignCallback" />
  </div>
</template>

<script setup lang='ts'>
import type { IlisMark } from '~/components/ilisComponent/marks/IlisMarks.vue'
import type { ICustomColumns } from '~/hooks/useTableHooks'
import { DownOutlined } from '@ant-design/icons-vue'
import { useToNumber } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getChosenColumns } from '~/api/common'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { CustomAttribute } from '~/components/customAttribute'
import HtButtonGroup from '~/components/htButtonGroup'
import { OnlineSginatureModal } from '~/components/onlineSignature'
import { BaseSpinWrapper } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useIndustryStore } from '~/store/industryStore'
import { pageListApi } from './api'
import HandlePrint from './components/HandlePrint.vue'
import ListSamples from './components/ListSamples.vue'
import SeeSign from './components/SeeSign.vue'
import SignStatus from './components/SignStatus.vue'
import { ConsignListEntity } from './ConsignListEntity'
import { CONSIGN_STATUS, ConsignCustomColumn } from './dict'
import { useHandler } from './modules/useHandler'

function getQueryParams() {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    /**
     * 查询类型：其他页面跳转带入
     * 0: 待提交收样信息
     * 1: 待提交收样信息(待提交)
     * 2: 本周提交收样 —— 已移除该查询
     * 3: 本月提交收样 —— 已移除该查询
     * 4: 委托信息统计（过滤掉 正在录入和作废的委托）
     * 5: 退回
     * 7: 通知修改
     */
    initSearchType: urlParams.get('initSearchType') || '',
    consignDates: urlParams.get('consignDates') || '',
  }
}

const { term } = useIndustryStore()

/** 导出列表 */
const exportList = computed(() => [
  { title: '导出委托台账(按委托导出)', key: 'consignLedger' },
  { title: `导出委托台账(按${term('样品')}导出)`, key: 'sampleLedger' },
  { title: '批量导出委托单', key: 'consignBill' },
])

/** ## 列筛选字典 */
const consignCustomColumnDict = computed(() => {
  return AnyDictionaryHelper.createDictionaryArray([
    {
      key: ConsignCustomColumn.CONSIGN_INFO,
      label: '委托信息列',
    },
    {
      key: ConsignCustomColumn.SAMPLE_INFO,
      label: `${term('样品')}信息列`,
    },
    {
      key: ConsignCustomColumn.CONSIGN_LEDGER,
      label: '委托台账列(按委托导出)',
    },
    {
      key: ConsignCustomColumn.SAMPLE_LEDGER,
      label: `委托台账列(按${term('样品')}导出)`,
    },
  ])
})

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  selectedRowKeys,
  selectedRows,
  lastSearchParams,
  getList,
  handleReset,
  handleSearch,
  handleReloadTable,
  getPagination,
  getCustomRow,
  getRowSelection,
  handleSortChange,
} = useTableHooks<ConsignListEntity>({
  customType: ConsignCustomColumn.CONSIGN_INFO,
  api: pageListApi,
  sizeKey: 'rows',
  immediate: false, // 存在initquery，会触发search
  responseDataTransform(res) {
    formatColumnValue(res.rows)
    return res
  },
})

const customColumnType = ref(ConsignCustomColumn.CONSIGN_INFO)
const customSampleColumns = ref<ICustomColumns[]>([])

const {
  handleLoading,
  onlineSginatureRef,
  goDetail,
  goConsignDetail,
  handleAdd,
  handleDetail,
  handleEdit,
  handleComplete,
  handleCopy,
  handleVoid,
  handleWithdraw,
  handleDelete,
  handleExport,
  handleChangeContract,
  handleSign,
  handleSignCallback,
  handleSaveRemark,
  handleCreateConsignBill,
} = useHandler(selectedRowKeys, selectedRows, handleReloadTable)

const { getField } = useIndustryStore()
const hiddenFields = computed(() => {
  const arr = []
  const industryProjectField = getField('project')
  if (!industryProjectField?.selected) {
    arr.push('projectTenderName')
  }
  return arr
})

function customRowConfig(row: ConsignListEntity) {
  return {
    onDblclick() {
      if (isShowEdit(row.consignStatus, row.isDelete))
        handleEdit(row)
      else
        handleDetail(row)
    },
  }
}

/** 兼容旧页面跨iframe交互 */
window.InitObj = {
  goDetail,
  goConsignDetail,
  strRef: false,
  reloadDataGrid: getList,
}

onMounted(() => {
  initSampleColumns()
})

/** 初始默认筛选项 */
const initQuery = ref(ConsignListEntity.fromJSON({}))

function initQueryParams() {
  const { initSearchType, consignDates } = getQueryParams()
  if (initSearchType === '0') {
    const realName = JSON.parse(localStorage.getItem('userInfo') || '{}').realName
    initQuery.value.sampleAcceptorName = realName
  }
  if (initSearchType === '0' || initSearchType === '1') {
    initQuery.value.status = [CONSIGN_STATUS.WRITE, CONSIGN_STATUS.RETURN, CONSIGN_STATUS.SAMPLE_RETURN, CONSIGN_STATUS.EDIT]
  }
  // 委托信息统计（过滤掉 正在录入和作废的委托）
  else if (initSearchType === '4') {
    initQuery.value.status = [CONSIGN_STATUS.FINISH, CONSIGN_STATUS.RETURN, CONSIGN_STATUS.SAMPLE_RETURN, CONSIGN_STATUS.EDIT]
  }
  // 退回
  else if (initSearchType === '5') {
    initQuery.value.status = [CONSIGN_STATUS.RETURN]
  }
  // 通知修改
  else if (initSearchType === '7') {
    initQuery.value.status = [CONSIGN_STATUS.EDIT]
  }
  if (consignDates) {
    initQuery.value.consignDate = consignDates.split(' ~ ') as any
  }
}
initQueryParams()

/** 是否显示编辑按钮 */
function isShowEdit(status: CONSIGN_STATUS, isDelete: 1 | 0) {
  return status !== CONSIGN_STATUS.FINISH && status !== CONSIGN_STATUS.CANCEL && isDelete === 0
}

/** 初始化标记 */
function initMarks(row: ConsignListEntity) {
  const marks: IlisMark[] = []
  const status = row.consignStatus
  if (status === '30') {
    marks.push({ mark: '废', description: '委托已作废', color: 'grey' })
  }
  else if (status === '40' || status === '45') {
    const tipsMsg = status === '40' ? '任务退回' : '有样品退回'
    marks.push({ mark: '退', description: tipsMsg, color: 'red' })
  }
  else if (status === '50') {
    marks.push({ mark: '通', description: '通知修改委托', color: 'green' })
  }
  else if (row.isPreconsign === 1) {
    marks.push({ mark: '预', description: '来源于预委托', color: '#07acc9' })
  }
  if (row.taskSource === '2') {
    marks.push({ mark: '综', description: '综合任务', color: 'blue' })
  }
  if (row.urgentStatus === '10') {
    marks.push({ mark: '急', description: '委托下有样品需要加急检测', color: 'green' })
  }
  if (row.releaseSn) {
    marks.push({ mark: '释', description: '已释放所有编号', color: 'red' })
  }
  return marks
}

/** 搜索 */
function customSearch(q: any) {
  for (const key in q) {
    const v = q[key]
    if (key === 'consignDate') {
      if (v && v[1])
        q.consignDates = v.join(' ~ ')
      else
        q.consignDates = ''
      delete q.consignDate
    }

    if (key === 'plannedTestDate') {
      if (v && v[1]) {
        q.plannedTestDateStart = v[0]
        q.plannedTestDateEnd = v[1]
        delete q.plannedTestDate
      }
    }

    else if (key === 'status') {
      q.status = v ? v.toString() : ''
    }
    else if (key === 'consignCodeRange' || key === 'testObjectCodeRange') {
      const v1 = v && v[0] !== '' && v[0] !== undefined
      const v2 = v && v[1] !== '' && v[1] !== undefined
      q[key] = (v1 && v2) ? v.toString() : ''
      if ((!v1 && v2) || (v1 && !v2)) {
        message.warn('请填写完整的编号范围')
      }
    }
  }
  if (q.consignOrigin) {
    if (q.consignOrigin === '1') { // 委托
      q.consignBigType = 1
      q.isPreconsign = 0
    }
    else if (q.consignOrigin === '2') { // 综合任务
      q.consignBigType = 2
      q.isPreconsign = 0
    }
    else if (q.consignOrigin === '3') { // 预委托
      q.consignBigType = 1
      q.isPreconsign = 1
    }
  }
  else {
    q.consignBigType = ''
    q.isPreconsign = ''
  }
  delete q.consignOrigin
  handleSearch(q)
}

/** 列筛选 */
function openCustomColumns(e: any, open: () => void) {
  customColumnType.value = e.key
  nextTick(() => {
    open()
  })
}
/** 确认列筛选 */
function confirmCustomColumns() {
  if (customColumnType.value === ConsignCustomColumn.CONSIGN_INFO) {
    handleReloadTable()
  }
  else if (customColumnType.value === ConsignCustomColumn.SAMPLE_INFO) {
    initSampleColumns()
  }
}

/** 初始化样品列 */
async function initSampleColumns() {
  const { data } = await getChosenColumns(ConsignCustomColumn.SAMPLE_INFO)
  customSampleColumns.value = data?.map((item) => {
    return {
      title: item.columnName,
      dataIndex: item.columnKey,
      width: 120,
    }
  }) || []
}

/** 费用字段：委托金额、已缴费用、应缴费用、待缴费用、合计金额、折前费用、剩余欠款 */
const feeField: string[] = ['manualFeeTotal', 'feePaid', 'feeTotal', 'needPay', 'feeOrigin', 'priceBeforeDiscount', 'banlance']
/**
 * 费用字段格式化
 * @param {string | number} v - 需要格式化的值
 * @param {number} [fixed] - 小数点后保留的位数，默认为2
 * @returns {string} 格式化后的字符串
 *
 * 示例：
 * formatMoney(123456.789) // "123,456.79"
 * formatMoney(123456.789, 4) // "123,456.7890"
 * formatMoney(0) // "0.00"
 * formatMoney('') // "0.00"
 * formatMoney(null) // "0.00"
 * formatMoney(undefined) // "0.00"
 */
function formatMoney(v: string | number, fixed?: number) {
  if (!v)
    return Number(0).toFixed(fixed || 2)
  const n = useToNumber(v).value || 0
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: fixed || 2,
    maximumFractionDigits: fixed || 2,
  })
}

/** 列数据格式化处理 */
function formatColumnValue(datas: ConsignListEntity[]) {
  for (let i = 0; i < datas.length; i++) {
    const d: any = datas[i]
    d.consignObjectName = mergeColumnData(d.consignObjectName)
    d.sampleNum = mergeColumnData(d.sampleNum)
    d.testObjectStandards = mergeColumnData(d.testObjectStandards)
    // 折后费用
    d.objectFee = `¥ ${formatMoney(d.objectFee, 4)}`
    feeField.forEach((field) => {
      d[field] = `¥ ${formatMoney(d[field])}`
    })
    if (!d.minimumProgressStatus) {
      d.minimumProgressStatus = d.consignStatus === CONSIGN_STATUS.FINISH ? '待分配' : ''
    }
  }
}

/** 委托下同样品名称、样品数量、规格型号的，合并展示，显示具体数量 */
function mergeColumnData(names?: string) {
  if (!names)
    return ''
  const nameArr = names.split(';')
  const obj: Record<string, number> = {}
  nameArr.forEach((item) => {
    const k = item.trim()
    // 过滤掉空字符串
    if (!k)
      return

    if (!obj[k])
      obj[k] = 1
    else
      obj[k]++
  })
  const arr = []
  for (const key in obj) {
    const v = obj[key]
    if (v > 1)
      arr.push(`${key}(${v})`)
    else
      arr.push(key)
  }
  return arr.join(';')
}
</script>

<style scoped>
.remark-textarea{
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
}
.remark-textarea .ant-input {
  height: 100%;
  resize: none;
}
.remark-textarea .ant-input:not(:focus){
  border-color: transparent;
}
</style>
