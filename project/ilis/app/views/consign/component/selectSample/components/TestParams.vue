<template>
  <div>
    <a-space class="mb-2">
      <template v-if="!pageState.isDetailPage && !pageState.isNoticeModifyConsign">
        <a-button type="primary" :disabled="!isSelectParams" @click="setSelectStandardVisible(true)">
          选择规程
        </a-button>
        <template v-if="mainController.sampleIndustryService.enableField.selectedBuildParam">
          <a-button :disabled="!useBasicInfo.data.bigCategoryId" @click="setCustomPackParamsVisible(true)">
            自定义{{ term('参数') }}打包
          </a-button>
          <a-button :disabled="!useBasicInfo.data.bigCategoryId" @click="setManagePackParamsVisible(true)">
            管理打包{{ term('参数') }}
          </a-button>

          <a-select
            v-model:value="useTestParams.paramPackId"
            allow-clear
            class="w-[240px]"
            :placeholder="`请选择打包${term('参数')}`"
            @change="useTestParams.useParamPack()"
          >
            <a-select-option v-for="d in useBasicInfo.paramPackOptions" :key="d.id" :value="d.id">
              {{ d.name }}
            </a-select-option>
          </a-select>
        </template>
      </template>

      <a-button v-if="!pageState.isNoticeModifyConsign" @click="useTestParams.switchOnlyShowSelected()">
        {{ useTestParams.onlyShowSelected ? `展开未勾选${term('参数')}` : `收起未勾选${term('参数')}` }}
      </a-button>
    </a-space>

    <div ref="tableWrapRef">
      <a-table
        :row-key="getTableRowKey"
        size="small"
        :loading="useTestParams.tableLoading"
        :columns="columns"
        :data-source="virtualRows"
        :row-class-name="tableRowClassName"
        :row-selection="rowSelection()"
        :custom-row="customRow"
        :pagination="false"
        :scroll="{ y: tableHeight }"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="isVirtualSpacerRow(record)">
            <template v-if="column.dataIndex === 'displayName'">
              <div :style="{ height: `${record.spacerHeight}px` }"></div>
            </template>
          </template>
          <template v-else>
            <template v-if="column.dataIndex === 'displayName'">
              <div v-if="record.isGroup">
                <a-flex justify="space-between">
                  <div class="font-bold">
                    {{ record.displayName }}
                  </div>
                  <div class="font-bold">
                    本组费用合计：￥{{ enableBlindSample ? '*' : groupTotalAmount(record.displayTotalAmount) }}
                  </div>
                </a-flex>
              </div>
              <a-input
                v-else
                v-model:value="record.displayName"
                :disabled="pageState.isDetailPage"
                :placeholder="placeholder(`请输入${term('检测参数')}名称`)"
              />
            </template>
            <template v-if="column.dataIndex === 'basis'">
              <div style="white-space: pre-wrap" v-html="handleStandardDisplay(record.basis, true)"></div>
            </template>
            <template v-if="column.dataIndex === 'standards'">
              <div style="white-space: pre-wrap" v-html="handleStandardDisplay(record.standards)"></div>
            </template>
            <template v-if="column.dataIndex === 'designRequirements'">
              <a-input
                v-model:value="record.designRequirements"
                :disabled="pageState.isDetailPage"
                :placeholder="placeholder('请输入设计要求')"
                @focus="bindSpecialCharacter(useTestParams.setSpecialCharacter(record.id))"
              />
            </template>
            <template v-if="column.dataIndex === 'checkPoint'">
              <a-input-number
                v-model:value="record.checkPoint"
                :disabled="pageState.isDetailPage || pageState.isNoticeModifyConsign"
                :min="1"
                :controls="false"
                class="!w-full"
                @change="useTestParams.refreshViewData()"
              />
            </template>
            <template v-if="column.dataIndex === 'unit'">
              <span>{{ record.unit || '点/次' }}</span>
            </template>
            <template v-if="column.dataIndex === 'prices'">
              <span v-if="enableBlindSample">*</span>
              <a-select
                v-else
                v-model:value="record.selectedPriceId"
                style="width: 100%"
                :disabled="pageState.isDetailPage || checkPriceDisabled(record as ViewTestParamsItem)"
                :title="record.price"
                @change="onSelectPrice(record as ViewTestParamsItem)"
              >
                <a-select-option
                  v-for="d in getPrices(record.prices)"
                  v-show="d._disabled"
                  :key="d.id"
                  :value="d.id"
                >
                  {{ getPriceLabel(d) }}：{{ d.price }}
                </a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'paramAmount'">
              <span v-if="enableBlindSample">*</span>
              <span v-else>{{ record.paramAmount }}</span>
            </template>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 选择规程 -->
    <SelectStandard v-model:open="selectStandardVisible" />

    <!-- 管理打包参数 -->
    <ManagePackParams v-model:open="managePackParamsVisible" />

    <!-- 自定义打包参数 -->
    <CustomPackParams v-model:open="customPackParamsVisible" />
  </div>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { UseTestParams } from '../modules/UseTestParams.ts'
import type { VirtualSpacerRow } from '~/views/consign/component/selectSample/hooks/useVirtualVariableRows.ts'
import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UsePeriod } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type {
  ParamPriceItem,
} from '~/views/consign/component/selectSampleParam/modules/UseParamPrice.ts'
import type { ParamStandardItem } from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import dayjs from 'dayjs'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { useIndustryStore } from '~/store/industryStore.ts'
import { useBlindSample } from '~/views/consign/component/selectSample/hooks/useBlindSample.ts'
import { isVirtualSpacerRow, useVirtualVariableRows } from '~/views/consign/component/selectSample/hooks/useVirtualVariableRows.ts'
import {
  PRICE_TYPE,
  PRICE_TYPE_DICT,
} from '~/views/consign/component/selectSampleParam/modules/UseParamPrice.ts'
import {
  checkPriceDisabled,
  customCell,
  rowClassName,
} from '~/views/consign/component/selectSampleParam/modules/UseSelectTestParam.ts'
import CustomPackParams from './CustomPackParams.vue'
import ManagePackParams from './ManagePackParams.vue'
import SelectStandard from './SelectStandard.vue'

const { term } = useIndustryStore()

// 主入口
const mainController = inject('mainController') as MainController

// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 检测参数
const useTestParams = inject('useTestParams') as UseTestParams
// 制样
const usePeriod = inject('usePeriod') as UsePeriod

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter') as (d: any) => unknown

const { SYSTEM_PARAM, pageState, placeholder } = mainController.consginPageParam

const [selectStandardVisible, setSelectStandardVisible] = useStateHooks(false)

const [managePackParamsVisible, setManagePackParamsVisible] = useStateHooks(false)

const [customPackParamsVisible, setCustomPackParamsVisible] = useStateHooks(false)

const { enableBlindSample } = useBlindSample(mainController.consginPageParam)

const { height: windowHeight } = useWindowSize()

const tableWrapRef = ref<HTMLElement>()

const tableHeight = computed(() => Math.max(260, windowHeight.value - 430))

const tableRows = computed(() => {
  return useTestParams.testParamsBindView
})

const { virtualRows, reset } = useVirtualVariableRows<ViewTestParamsItem>({
  rows: tableRows,
  tableWrapRef,
  getRowKey: (row, index) => getTableRowKey(row, index),
})

// 是否有选择样品参数
const isSelectParams = computed(() => !!useTestParams.selectedRows.length)

/** 分组价格显示：有样品单价时，显示样品单价 */
function groupTotalAmount(price: number) {
  return useBasicInfo.enableSamplePrice ? (useBasicInfo.data.samplePrice || 0) * useBasicInfo.data.sampleAmount : price
}

const columns = computed(() => {
  const c: ColumnsType = []
  c.push({
    title: term('检测参数'),
    dataIndex: 'displayName',
    customCell: (row) => {
      if (isVirtualSpacerRow(row)) {
        return { colSpan: 99 }
      }
      if (row.isGroup) {
        return { colSpan: useBasicInfo.DISPLAYS_TEST_PERIOD ? 11 : 10 }
      }
      return { colSpan: 1 }
    },
    width: '15%',
  })
  c.push({ title: '备注', dataIndex: 'remark', width: '12%', customCell: tableCustomCell })
  c.push({ title: '检测依据', dataIndex: 'basis', width: useBasicInfo.DISPLAYS_TEST_PERIOD ? '17%' : '20%', customCell: tableCustomCell })
  if (mainController.sampleIndustryService.enableField.isNeedConclusion) {
    c.push({ title: '评定标准', dataIndex: 'standards', width: useBasicInfo.DISPLAYS_TEST_PERIOD ? '17%' : '20%', customCell: tableCustomCell })
  }
  if (useBasicInfo.DISPLAYS_TEST_PERIOD) {
    c.push({ title: '周期(天)', dataIndex: 'paramWorkDay', width: '5%', customCell: tableCustomCell })
  }
  c.push({ title: '设计要求', dataIndex: 'designRequirements', width: '10%', customCell: tableCustomCell })
  c.push({ title: '数量', dataIndex: 'checkPoint', width: '4%', customCell: tableCustomCell })
  if (mainController.sampleIndustryService.enableField.checkPoint) {
    c.push({ title: '单位', dataIndex: 'unit', width: '5%', customCell: tableCustomCell })
  }
  if (!useBasicInfo.enableSamplePrice) {
    c.push({ title: '单价(元)', dataIndex: 'prices', width: '8%', customCell: tableCustomCell })
    c.push({ title: '小计', dataIndex: 'paramAmount', width: '4%', customCell: tableCustomCell })
  }

  return c
})

function rowSelection() {
  return {
    selectedRowKeys: useTestParams.selectedRowKey,
    onChange: () => {
      useTestParams.refreshViewData()
      // 发布参数列表变更事件
      useTestParams.publishFieldChange('testParams')
      // 检查制样信息
      usePeriod.checkDelParams(useTestParams.selectedRows)
    },
    onSelect: (row: ViewTestParamsItem | any, selected: boolean) => {
      if (isVirtualSpacerRow(row)) {
        return
      }
      if (!pageState.isDetailPage && !pageState.isNoticeModifyConsign) {
        useTestParams.updateParamData(row.id, 'selected', selected)
      }
    },
    onSelectAll: (selected: boolean) => {
      if (!pageState.isDetailPage && !pageState.isNoticeModifyConsign) {
        useTestParams.testParams.forEach((item) => {
          useTestParams.updateParamData(item.id, 'selected', selected)
        })
      }
    },
    getCheckboxProps: (record: any) => {
      if (isVirtualSpacerRow(record)) {
        return { disabled: true }
      }
      return {
        disabled: record.disabled,
      }
    },
  }
}

function tableCustomCell(row: any) {
  if (isVirtualSpacerRow(row)) {
    return { colSpan: 0 }
  }
  return customCell(row)
}

function tableRowClassName(record: ViewTestParamsItem | VirtualSpacerRow) {
  if (isVirtualSpacerRow(record)) {
    return 'virtual-spacer-row'
  }
  return rowClassName(record)
}

function getTableRowKey(record: ViewTestParamsItem | VirtualSpacerRow, index = 0) {
  if (isVirtualSpacerRow(record)) {
    return record.id
  }
  if (record.isGroup) {
    return `${record.id}-${index}`
  }
  return record.id
}

function customRow(record: ViewTestParamsItem | VirtualSpacerRow) {
  if (isVirtualSpacerRow(record)) {
    return { class: 'virtual-spacer-row' }
  }
  return {}
}

function getPriceLabel(priceItem: ParamPriceItem) {
  const priceType = priceItem.type
  if (priceType === PRICE_TYPE.CHILD || priceType === PRICE_TYPE.CUSTOM) {
    return priceItem.qualifier ? term(priceItem.qualifier) : ''
  }
  return term(PRICE_TYPE_DICT.getLabelByKey(priceType))
}

function getPrices(prices: ParamPriceItem[]) {
  return prices.filter(i => !i._disabled)
}

/** 选择价格 */
function onSelectPrice(item: ViewTestParamsItem) {
  const { id, selectedPriceId, prices } = item
  const priceItem = prices.find(i => i.id === selectedPriceId)

  useTestParams.updateParamData(id, 'price', priceItem?.price)
  useTestParams.updateParamData(id, 'selectedPriceType', priceItem?.type)
  useTestParams.updateParamData(id, 'priceType', priceItem?.type)
  useTestParams.updateParamData(id, 'selectedPriceId', priceItem?.id)
  useTestParams.refreshViewData()
}

const today = dayjs().format('YYYY-MM-DD')
// 过期
function isExpire(expireDate?: number | string) {
  const t = expireDate ? dayjs(expireDate).format('YYYY-MM-DD') : ''
  return t && dayjs(t).isBefore(dayjs(today))
}

/** 规程显示 */
function handleStandardDisplay(data: ParamStandardItem[], isShowClauseCode?: boolean) {
  return data.filter(i => i.selected).map((i) => {
    const expire = isExpire(i.expireDate)
    const publishCode = i.publishCode ? `(${i.publishCode})` : ''
    const clauseCode = isShowClauseCode && SYSTEM_PARAM.OTHER_9 && i.clauseCode ? ` <span style="color: #4096ff;">${i.clauseCode}</span>` : ''
    return `<span style="color: ${expire ? 'red' : 'inherit'};">${i.baseStandardName}${publishCode}</span>${clauseCode}`
  }).join('\n')
}

watch(() => useTestParams.onlyShowSelected, () => {
  nextTick(() => {
    reset()
  })
})
</script>

<style scoped>
:deep(.group-row),
:deep(.group-row:hover > td),
:deep(.ant-table-row-selected.group-row > td){
  background-color: #eee !important;
}
:deep(.group-row .ant-table-selection-column){
  display: none;
}
:deep(.virtual-spacer-row > td){
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
}
:deep(.virtual-spacer-row .ant-table-selection-column){
  display: none;
}
</style>
