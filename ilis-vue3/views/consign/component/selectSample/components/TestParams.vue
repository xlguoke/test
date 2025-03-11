<template>
  <div>
    <a-space class="mb-2">
      <template v-if="!readonly && !isNoticeModifyConsign">
        <a-button type="primary" :disabled="!isSelectParams" @click="setSelectStandardVisible(true)">
          选择规程
        </a-button>
        <a-button :disabled="!useBasicInfo.data.bigCategoryId" @click="setCustomPackParamsVisible(true)">
          自定义参数打包
        </a-button>
        <a-button :disabled="!useBasicInfo.data.bigCategoryId" @click="setManagePackParamsVisible(true)">
          管理打包参数
        </a-button>

        <a-select
          v-model:value="useTestParams.paramPackId"
          allow-clear
          class="w-[240px]"
          placeholder="请选择打包参数"
          @change="useTestParams.useParamPack()"
        >
          <a-select-option v-for="d in useBasicInfo.paramPackOptions" :key="d.id" :value="d.id">
            {{ d.name }}
          </a-select-option>
        </a-select>
      </template>

      <a-button v-if="!isNoticeModifyConsign" @click="useTestParams.switchOnlyShowSelected()">
        {{ useTestParams.onlyShowSelected ? "展开未勾选参数" : "收起未勾选参数" }}
      </a-button>
    </a-space>

    <a-table
      row-key="id"
      size="small"
      :loading="useTestParams.tableLoading"
      :columns="columns"
      :data-source="useTestParams.testParamsBindView"
      :row-class-name="rowClassName"
      :row-selection="rowSelection()"
      :pagination="false"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'displayName'">
          <div v-if="record.isGroup">
            <a-flex justify="space-between">
              <div class="font-bold">
                {{ record.displayName }}
              </div>
              <div class="font-bold">
                本组费用合计：￥{{ enableBlindSample ? '*' : record.displayTotalAmount }}
              </div>
            </a-flex>
          </div>
          <a-input
            v-else
            v-model:value="record.displayName"
            :disabled="readonly"
            :placeholder="placeholder('请输入检测参数名称')"
          />
        </template>
        <template v-if="column.dataIndex === 'basis'">
          <div style="white-space: pre-wrap" v-html="handleStandardDisplay(record.basis)"></div>
        </template>
        <template v-if="column.dataIndex === 'standards'">
          <div style="white-space: pre-wrap" v-html="handleStandardDisplay(record.standards)"></div>
        </template>
        <template v-if="column.dataIndex === 'designRequirements'">
          <a-input
            v-model:value="record.designRequirements"
            :disabled="readonly"
            :placeholder="placeholder('请输入设计要求')"
            @focus="bindSpecialCharacter(useTestParams.setSpecialCharacter(record.id))"
          />
        </template>
        <template v-if="column.dataIndex === 'checkPoint'">
          <a-input-number
            v-model:value="record.checkPoint"
            :disabled="readonly || isNoticeModifyConsign"
            :min="1"
            @change="useTestParams.refreshViewData()"
          />
        </template>
        <template v-if="column.dataIndex === 'unit'">
          <span>点/次</span>
        </template>
        <template v-if="column.dataIndex === 'prices'">
          <span v-if="enableBlindSample">*</span>
          <a-select
            v-else
            v-model:value="record.selectedPriceId"
            style="width: 100%"
            :disabled="readonly || checkPriceDisabled(record)"
            :title="record.price"
            @change="onSelectPrice(record)"
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
    </a-table>

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
import SelectStandard from './SelectStandard.vue'
import ManagePackParams from './ManagePackParams.vue'
import CustomPackParams from './CustomPackParams.vue'
import type {
  ParamPriceItem,
} from '~/views/consign/component/selectSampleParam/modules/UseParamPrice.ts'
import {
  PRICE_TYPE,
  PRICE_TYPE_DICT,
} from '~/views/consign/component/selectSampleParam/modules/UseParamPrice.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import {
  checkPriceDisabled,
  customCell,
  rowClassName,
} from '~/views/consign/component/selectSampleParam/modules/UseSelectTestParam.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { ParamStandardItem } from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'
import { useBlindSample } from '~/views/consign/component/selectSample/hooks/useBlindSample.ts'
import type { UsePeriod } from '~/views/consign/component/selectSample/modules/UsePeriod.ts'
import { usePageParams } from '~/views/consign/component/selectSample/hooks/usePageParams.ts'

// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 检测参数
const useTestParams = inject('useTestParams') as UseTestParams
// 制样
const usePeriod = inject('usePeriod') as UsePeriod

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter')

const { readonly, placeholder, isNoticeModifyConsign } = usePageState()

const { OTHER_9 } = usePageParams()

const [selectStandardVisible, setSelectStandardVisible] = useStateHooks(false)

const [managePackParamsVisible, setManagePackParamsVisible] = useStateHooks(false)

const [customPackParamsVisible, setCustomPackParamsVisible] = useStateHooks(false)

const { enableBlindSample } = useBlindSample()

// 是否有选择样品参数
const isSelectParams = computed(() => !!useTestParams.selectedRows.length)

const columns = computed(() => {
  const c: ColumnsType = [
    { title: '检测参数', dataIndex: 'displayName', width: '13%', customCell: (row) => {
      if (row.isGroup) {
        return { colSpan: useBasicInfo.DISPLAYS_TEST_PERIOD ? 11 : 10 }
      }
      return { colSpan: 1 }
    } },
    { title: '参数备注', dataIndex: 'remark', width: '12%', customCell },
    { title: '评定标准', dataIndex: 'standards', width: '20%', customCell },
    { title: '检测依据', dataIndex: 'basis', width: '20%', customCell },
    { title: '设计要求', dataIndex: 'designRequirements', width: '10%', customCell },
    { title: '数量', dataIndex: 'checkPoint', width: '5%', customCell },
    { title: '单位', dataIndex: 'unit', width: '5%', customCell },
    { title: '单价(元)', dataIndex: 'prices', width: '10%', customCell },
    { title: '小计', dataIndex: 'paramAmount', width: '5%', customCell },
  ]

  if (useBasicInfo.DISPLAYS_TEST_PERIOD) {
    c[2].width = '17%'
    c[3].width = '17%'
    c.splice(c.length - 5, 0, { title: '周期(天)', dataIndex: 'paramWorkDay', width: '6%', customCell })
  }

  return c
})

const rowSelection = function () {
  return {
    selectedRowKeys: useTestParams.selectedRowKey,
    onChange: () => {
      useTestParams.refreshViewData()
      // 发布参数列表变更事件
      useTestParams.publishFieldChange('testParams')
      // 检查制样信息
      usePeriod.checkDelParams(useTestParams.selectedRows)
    },
    onSelect: (row: ViewTestParamsItem, selected: boolean) => {
      if (!readonly.value && !isNoticeModifyConsign.value) {
        useTestParams.updateParamData(row.id, 'selected', selected)
      }
    },
    onSelectAll: (selected: boolean) => {
      if (!readonly.value && !isNoticeModifyConsign.value) {
        useTestParams.testParams.forEach((item) => {
          useTestParams.updateParamData(item.id, 'selected', selected)
        })
      }
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.disabled,
    }),
  }
}

function getPriceLabel(priceItem: ParamPriceItem) {
  const priceType = priceItem.type
  if (priceType === PRICE_TYPE.CHILD || priceType === PRICE_TYPE.CUSTOM) {
    return priceItem.qualifier
  }
  return PRICE_TYPE_DICT.getLabelByKey(priceType)
}

function getPrices(prices) {
  return prices.filter(i => !i._disabled)
}

/** 选择价格 */
function onSelectPrice(item: ViewTestParamsItem) {
  const { id, selectedPriceId, prices } = item
  const priceItem = prices.find(i => i.id === selectedPriceId)

  useTestParams.updateParamData(id, 'price', priceItem.price)
  useTestParams.updateParamData(id, 'selectedPriceType', priceItem.type)
  useTestParams.updateParamData(id, 'priceType', priceItem.type)
  useTestParams.updateParamData(id, 'selectedPriceId', priceItem.id)
  useTestParams.refreshViewData()
}

/** 规程显示 */
function handleStandardDisplay(data: ParamStandardItem[]) {
  return data.filter(i => i.selected).map((i) => {
    const publishCode = i.publishCode ? `(${i.publishCode})` : ''
    const clauseCode = OTHER_9.value && i.clauseCode ? ` <span style="color: #4096ff;">${i.clauseCode}</span>` : ''
    return `${i.baseStandardName}${publishCode}${clauseCode}`
  }).join('\n')
}
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
</style>
