<template>
  <div class="h-full flex flex-col">
    <a-flex justify="space-between" align="start" gap="small">
      <a-space wrap>
        <a-select
          v-if="!USING_RECOMMENDED_PARAMETER_STANDARD || (USING_RECOMMENDED_PARAMETER_STANDARD && useParamStandard.isNeedConclusion)"
          v-model:value="queryStanardUniqKey"
          allow-clear
          class="w-[240px]"
          placeholder="请选择评定标准"
          @change="filterData(true)"
        >
          <a-select-option v-for="d in useSelectTestParam.standardOptions" :key="d.uniqKey" :value="d.uniqKey">
            {{ showStandardName ? `${d.baseStandardName}${d.publishCode}` : (d.publishCode || d.baseStandardName) }}
          </a-select-option>
        </a-select>
        <a-input-search
          v-model:value.trim="queryParam"
          placeholder="请输入检测参数"
          style="width: 240px;"
          @press-enter="filterData"
          @search="filterData"
        >
          <template #enterButton>
            <a-button type="primary" class="flex items-center">
              <SearchOutlined />
            </a-button>
          </template>
        </a-input-search>
        <a-button @click="queryReset()">
          重置
        </a-button>
      </a-space>
      <a-space>
        <a-select
          v-model:value="useParamPackId"
          allow-clear
          class="w-[150px]"
          placeholder="应用打包参数"
          @change="onSelectParamPack"
        >
          <a-select-option v-for="d in paramPackList" :key="d.id" :value="d.id">
            {{ d.name }}
          </a-select-option>
        </a-select>
        <a-button :disabled="tableLoading" @click="selectedSearchActive">
          选中高亮
        </a-button>
        <a-button :disabled="tableLoading" class="flex items-center" @click="changeMode">
          {{ !isSimpleMode ? '专业模式' : '简易模式' }} <SwapOutlined class="text-[#0066ec]" />
        </a-button>
      </a-space>
    </a-flex>

    <a-alert class="mt-2" show-icon>
      <template #message>
        <a-flex justify="space-between" align="center">
          <div>
            当前已选中
            <span class="text-red-500">{{ selectedRowKeys.length }}</span>
            个参数，预计费用
            <span class="font-semibold text-sm">{{ useSelectTestParam.totalPrice }}</span>
            元
          </div>
          <a-space v-if="props.sampleNode" size="middle">
            <a-checkbox v-model:checked="useParamStandard.isNeedConclusion" class="select-none" @change="onChangeIsNeedConclusion">
              需要评定结果
            </a-checkbox>
            <a-checkbox v-model:checked="showStandardName" class="select-none">
              显示规程名称
            </a-checkbox>
            <a-checkbox
              v-model:checked="showSelectedOnly"
              class="select-none"
              :disabled="!!queryStanardUniqKey"
              @change="filterData"
            >
              仅查看已选中参数
            </a-checkbox>
          </a-space>
        </a-flex>
      </template>
    </a-alert>

    <div ref="tableBoxRef" class="my-2 flex-1 overflow-auto">
      <a-table
        bordered
        row-key="id"
        size="small"
        :columns="columns"
        :data-source="useSelectTestParam.data"
        :row-class-name="rowClassName"
        :row-selection="getRowSelection()"
        :custom-row="customRow"
        :pagination="false"
        :loading="tableLoading"
        :scroll="{ y: tableHeight, x: 1200 }"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'basis'">
            <a-flex justify="space-between" align="center">
              <div>
                检测依据
                <a-tooltip title="红色代表规程已过期">
                  <QuestionCircleOutlined class="ml-2 text-sm text-blue-500 " />
                </a-tooltip>
              </div>
              <a-dropdown-button
                v-if="USING_RECOMMENDED_PARAMETER_STANDARD && recommendBasis.length"
                :trigger="['click']"
                size="small"
                :disabled="!useSelectTestParam.data.length"
              >
                推荐依据
                <template #overlay>
                  <a-menu @click="onUseRecommendBasis">
                    <a-menu-item v-for="item in recommendBasis" :key="item">
                      {{ item }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown-button>
            </a-flex>
          </template>
          <template v-if="column.dataIndex === 'standards'">
            <a-flex justify="space-between" align="center">
              <div>
                评定标准
                <a-tooltip title="红色代表规程已过期">
                  <QuestionCircleOutlined class="ml-2 text-sm text-blue-500 " />
                </a-tooltip>
              </div>
              <a-dropdown-button
                v-if="USING_RECOMMENDED_PARAMETER_STANDARD && recommendStandards.length"
                :trigger="['click']"
                size="small"
                :disabled="!useSelectTestParam.data.length"
              >
                推荐标准
                <template #overlay>
                  <a-menu @click="onUseRecommendStandards">
                    <a-menu-item v-for="item in recommendStandards" :key="item">
                      {{ item }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown-button>
            </a-flex>
          </template>
          <template v-if="column.dataIndex === 'prices'">
            单价（元）
            <a-tooltip title="共用单价、脚本单价、参数单价、样品单价、自定义子单价">
              <QuestionCircleOutlined class="ml-2 text-sm text-blue-500 " />
            </a-tooltip>
          </template>
        </template>

        <template #bodyCell="{ column, text, index, record }">
          <template v-if="column.dataIndex === 'displayName'">
            <span :class="`${record.isSearch ? 'text-orange-500' : ''}`">
              {{ record.displayName }}
            </span>
          </template>
          <template v-if="column.dataIndex === 'testQuantity'">
            <template v-if="isDefined(record.selectedTestQuantity)">
              {{ record.selectedTestQuantity }}{{ record.unitMeasure }}
            </template>
          </template>
          <template v-else-if="column.dataIndex === 'basis'">
            <ParamsStandard
              v-model:value="record.selectedBasis"
              :data-source="record.basis"
              :show-name="showStandardName"
              :enable-recommend="USING_RECOMMENDED_PARAMETER_STANDARD"
              :standard-type="STANDARD_TYPE.BASIS"
              @add="handleAddStandard(index, STANDARD_TYPE.BASIS)"
              @click.stop="() => {}"
            />
          </template>
          <template v-else-if="column.dataIndex === 'standards'">
            <ParamsStandard
              v-model:value="record.selectedStandards"
              :data-source="record.standards"
              :show-name="showStandardName"
              :enable-recommend="USING_RECOMMENDED_PARAMETER_STANDARD"
              :standard-type="STANDARD_TYPE.STANDARD"
              @add="handleAddStandard(index, STANDARD_TYPE.STANDARD)"
              @click.stop="() => {}"
              @select="(key) => { useParamStandard.onSelectStandard(record, key) }"
              @deselect="(key) => { useParamStandard.onDeselectStandard(record, key) }"
              @delete-tag="(key) => { useParamStandard.onDeselectStandard(record, key) }"
            />
          </template>
          <template v-else-if="column.dataIndex === 'prices'">
            <a-select
              v-model:value="record.selectedPriceId"
              style="width: 100%"
              :disabled="checkPriceDisabled(record)"
              :title="record.price"
              @change="onSelectPrice(record)"
              @click.stop="() => {}"
            >
              <a-select-option v-for="d in getPrices(record.prices)" :key="d.id" :value="d.id">
                {{ d.type === PRICE_TYPE.CUSTOM ? d.qualifier : PRICE_TYPE_DICT.getLabelByKey(d.type) }}：{{ d.price }}
              </a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'paramNote'">
            <a-flex gap="middle" justify="space-between">
              <div class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="text">
                {{ text }}
              </div>
              <EditOutlined class="text-[#0066ec] text-sm cursor-pointer hover:opacity-80" @click.stop="addNote(record)" />
            </a-flex>
          </template>
          <template v-else-if="column.dataIndex === 'remark'">
            <div class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="text">
              {{ text }}
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <div v-if="useSelectTestParam.priceDescription.length" class="mb-2">
      <a-alert show-icon>
        <template #message>
          <a-tooltip
            destroy-tooltip-on-hide
            color="#108ee9"
            placement="topLeft"
            :overlay-inner-style="{ width: '420px' }"
          >
            <template #title>
              <p v-for="(item, index) in useSelectTestParam.priceDescription" :key="index">
                {{ item }}；
              </p>
            </template>
            <div class="overflow-ellipsis overflow-hidden whitespace-nowrap">
              单价说明：{{ useSelectTestParam.priceDescription.join("；") }}
            </div>
          </a-tooltip>
        </template>
      </a-alert>
    </div>

    <ParamsRequirement :sample-id="sampleId" :test-item-ids="useSelectTestParam.testItemIds">
      <template #testQuantity>
        <a-alert v-if="useSelectTestParam.DISPLAYS_TEST_QUANTITY && useSelectTestParam.selectedRows.length" class="mb-1" show-icon>
          <template #message>
            根据您所选检测参数，预计应收样品数量为：
            <span class="text-blue-500 cursor-pointer underline" @click="setTestQuantityDetailVisible(true)">
              {{ useSelectTestParam.totalTestQuantity }}{{ useSelectTestParam.unitMeasure }}
            </span>
          </template>
        </a-alert>
      </template>
    </ParamsRequirement>
  </div>

  <!-- 添加附注 -->
  <AddNote
    v-model:open="visible"
    :value="paramNote"
    :loading="noteLoading"
    @save="onSaveNote"
  />

  <!-- 选择规程 -->
  <SelectedStandard v-model:open="standardVisible" :use-type="standardType" @select="handleAddStandardCallback" />

  <!-- 配置规程 -->
  <SelectedSettingStandard
    v-model:open="settingStandardVisible"
    :sample-id="sampleId"
    :param-ids="paramIds"
    @save="onSaveStandardSetting"
  />

  <!-- 应收样品数量详情 -->
  <TestQuantityDetail v-model:open="testQuantityDetailVisible" />
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { EditOutlined, QuestionCircleOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons-vue'
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { PropType } from 'vue'
import type { QueryParams } from '../api'
import { addParamNoteApi, paramsApi } from '../api'
import type { ParamStandardItem, StandardType } from '../modules/UseParamStandard.ts'
import type { ViewTestParamsItem } from '../modules/BaseTestParams.ts'
import { EmptyPriceId } from '../modules/BaseTestParams.ts'
import { UseSelectTestParam, checkPriceDisabled, customCell, rowClassName } from '../modules/UseSelectTestParam.ts'
import { PRICE_TYPE, PRICE_TYPE_DICT, ParamPriceItem } from '../modules/UseParamPrice.ts'
import { UseParamStandard } from '../modules/UseParamStandard.ts'
import AddNote from './AddNote.vue'
import ParamsStandard from './ParamsStandard.vue'
import ParamsRequirement from './ParamsRequirement.vue'
import TestQuantityDetail from './TestQuantityDetail.vue'
import { STANDARD_TYPE, STANDARD_TYPE_DICT } from '~/types/standard'
import { SelectedStandard, type StandardDatas } from '~/views/unit-config/standard'
import { useTableHeight } from '~/hooks/useTableHeight'
import type { SelectSampleEntity, SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam'
import type {
  BigCategoryTreeNode,
  ViewSampleTreeNode,
} from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import SelectedSettingStandard from '~/views/unit-config/standard/SettingStandard/SelectedSettingStandard.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { getSampleParamStandard } from '~/views/unit-config/standard/api.ts'
import { useParamPackHook } from '~/views/consign/component/selectSampleParam/hooks/useParamPackHook.ts'
import { UseParamPack } from '~/views/consign/component/selectSample/modules/UseParamPack.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import { usePageParams } from '~/views/consign/component/selectSampleParam/hooks/usePageParams.ts'

const props = defineProps({
  /** 选中的样品节点 */
  sampleNode: {
    type: Object as PropType<ViewSampleTreeNode>,
    default: () => {},
  },
  /** 展开的所有节点 */
  nodes: {
    type: Array as PropType<Array<BigCategoryTreeNode | ViewSampleTreeNode>>,
    default: () => ([]),
  },
})

// 从父页面注入的获取最终提交数据的方法
const setOnSubmit = inject('setOnSubmit') as (fn: () => SelectSampleParamEntity | false) => void
// 向父组件赋值获取数据方法
setOnSubmit(buildSubmitData)

// 样品页面的参数信息
const useTestParams = inject('useTestParams') as UseTestParams

// 样品页面的基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo

// 样品参数
const useSelectTestParam: UseSelectTestParam = reactive(new UseSelectTestParam())

useSelectTestParam.init()

provide('useSelectTestParam', useSelectTestParam)

// 规程相关数据及控制
const useParamStandard: UseParamStandard = reactive(new UseParamStandard(useBasicInfo.data.isNeedConclusion))

// 打包参数
const { useParamPackId, paramPackList, getParamPackList } = useParamPackHook()

const { USING_RECOMMENDED_PARAMETER_STANDARD } = usePageParams()

// 规程标准搜索
const queryStanardUniqKey = ref<string>()

// 检测参数搜索
const queryParam = ref('')

const sampleId = computed(() => props.sampleNode ? props.sampleNode.id : null)

const settingStandardVisible = ref(false)

const [testQuantityDetailVisible, setTestQuantityDetailVisible] = useStateHooks(false)

const showStandardName = ref(false)

const showSelectedOnly = ref(false)

const { tableHeight, tableBoxRef, initTableHeight } = useTableHeight(false)

const query = ref<QueryParams>({
  bigCategoryId: '',
  sampleId: '',
})

const tableLoading = ref(false)

const selectedRowKeys = computed(() => {
  return useSelectTestParam.selectedRowKey
})

const standardVisible = ref(false)

const standardType = ref<StandardType>(STANDARD_TYPE.ALL)

const dataIndex = ref(-1)

const paramIds = computed(() => {
  const item = useSelectTestParam.data[dataIndex.value]

  if (item) {
    return [item.id]
  }
  return undefined
})

/** 推荐检测依据 */
const recommendBasis = computed(() => {
  return getRecommendStandard('basis')
})

/** 推荐标准评定 */
const recommendStandards = computed(() => {
  return getRecommendStandard('standards')
})

watch(() => useSelectTestParam.priceDescription, () => {
  initTableHeight()
})

const columns = computed(() => {
  const c: ColumnsType = [
    { title: '参数名称', dataIndex: 'displayName', width: 150, customCell: (row) => {
      if (row.isGroup) {
        return { colSpan: 8 }
      }
      return { colSpan: 1 }
    } },
    { title: '检测依据', dataIndex: 'basis', customCell, width: 280 },
    { title: '单价(元)', dataIndex: 'prices', customCell, width: 150 },
    { title: '参数备注', dataIndex: 'remark', width: 120, customCell },
    { title: '附注', dataIndex: 'paramNote', customCell, width: 100 },
  ]

  if ((USING_RECOMMENDED_PARAMETER_STANDARD.value && useParamStandard.isNeedConclusion) || !USING_RECOMMENDED_PARAMETER_STANDARD.value) {
    c.splice(1, 0, { title: '评定标准', dataIndex: 'standards', customCell, width: 280 })
  }

  if (useSelectTestParam.DISPLAYS_TEST_PERIOD) {
    c.splice(c.length - 2, 0, { title: '周期(天)', dataIndex: 'paramWorkDay', width: 90, customCell })
  }

  if (useSelectTestParam.DISPLAYS_TEST_QUANTITY) {
    c.splice(c.length - 2, 0, { title: '试验数量', dataIndex: 'testQuantity', width: 90, customCell })
  }

  return c
})

function getPrices(prices) {
  return prices.filter(i => !i._disabled)
}

/** 构建提交的数据 */
function buildSubmitData() {
  // 选择的参数
  const params = useSelectTestParam.selectedRows
  // 选择样品信息
  const sample = props.sampleNode
  // 大类样品树 - 选中的所有层级
  const treeNodes = props.nodes
  // 大类样品树 - 选中的大类层级
  const bigCategoryTreeNodes = treeNodes.filter(i => !i.attributes.infoType) as BigCategoryTreeNode[]
  // 大类样品树 - 选中的样品层级
  const sampleTreeNodes = treeNodes.filter(i => !!i.attributes.infoType) as ViewSampleTreeNode[]

  // 样品层级名称及值，用于赋值规格型号
  const sampleLevelNameArr = []

  if (USING_RECOMMENDED_PARAMETER_STANDARD.value) {
    if (useParamStandard.isNeedConclusion) {
      if (params.some(i => !i.selectedBasis.length || !i.selectedStandards.length)) {
        Modal.warning({
          title: '提示',
          content: '评定标准或检测依据不能为空！',
        })
        return false
      }
    }
    else {
      if (params.some(i => !i.selectedBasis.length)) {
        Modal.warning({
          title: '提示',
          content: '检测依据不能为空！',
        })
        return false
      }
    }
  }

  if (!sample) {
    Modal.warning({
      title: '提示',
      content: '请选择样品！',
    })
    return false
  }

  if (!params.length) {
    Modal.warning({
      title: '提示',
      content: '请选择样品参数！',
    })
    return false
  }

  if (useSelectTestParam.SELECTED_SAMPLE_LAST_LAYER) {
    if (sample.children && sample.children.length > 0) {
      Modal.warning({
        title: '提示',
        content: '当前样品未选择至样品最后一级！',
      })
      return false
    }
  }

  // 样品层级名称及值，用于赋值规格型号
  [...sampleTreeNodes, sample].forEach((item) => {
    if (item.attributes) {
      sampleLevelNameArr.push({
        name: item.attributes.sampleLevelName,
        value: item.text,
      })
    }
  })

  /**
   * 按照之前的逻辑构建如下数据
   * 后续删除或精简掉一些，目前来看有很多重复的，但需要问问后端，是不是他们需要
   */
  const sampleData = sample as SelectSampleEntity
  const sampleLevelArr = sampleTreeNodes.map(i => i.text)
  sampleLevelArr.push(sampleData.text)

  sampleData.SampleLevelArr = `[${sampleLevelArr.join('-')}]`
  sampleData.SampleLevelStr = `[${sampleLevelArr.join('-')}]`
  // sampleData.ParentSampleList = [...sampleTreeNodes].reverse()
  sampleData.testUnitTestSampleId = sample.id
  sampleData.SystemId = sample.attributes.systemId

  const testItemIds: string[] = []
  const selectedParamIds: string[] = []
  // 样品层级的id
  const nodes: string[] = []
  const rootNode: {
    systemId?: string
    id?: string
    name?: string
  } = {}

  if (sampleTreeNodes.length > 0) {
    const lastSampleNode = sampleTreeNodes[0]
    rootNode.systemId = lastSampleNode.attributes.systemId
    rootNode.id = lastSampleNode.id
    rootNode.name = lastSampleNode.text
  }
  else {
    rootNode.systemId = sampleData.attributes.systemId
    rootNode.id = sampleData.id
    rootNode.name = sampleData.text
  }

  params.forEach((item) => {
    selectedParamIds.push(item.id)
    if (item.testItemId && !testItemIds.includes(item.testItemId)) {
      testItemIds.push(item.testItemId)
    }

    // 进行选中规程矫正，未选中的规程selected设为false
    item.basis = item.basis.map(i => ({
      ...i,
      selected: item.selectedBasis.includes(i.uniqKey),
    }))

    item.standards = item.standards.map(i => ({
      ...i,
      selected: item.selectedStandards.includes(i.uniqKey),
    }))
  })

  sampleTreeNodes.forEach((item) => {
    nodes.push(item.id)
  })
  nodes.push(sampleData.id)
  nodes.reverse()

  if (testItemIds && testItemIds.length > 1 && MainController.urlParams.compoundItems !== 'Y') {
    Modal.warning({
      title: '提示',
      content: '不允许收取不同检测项目下的参数，请重新选择(可在系统控制参数中，设置为允许跨检测项目收样)',
    })
    return
  }

  const data: SelectSampleParamEntity = {
    bigCategoryId: sampleData.categoryId,
    bigCategoryNames: bigCategoryTreeNodes.map(i => i.text).join('-'),
    bigCategoryInfo: bigCategoryTreeNodes.map((i, index) => ({
      id: i.id,
      level: index + 1,
      title: i.text,
    })),
    systemTestSampleId: sampleData.SystemId || '',
    testUnitTestSampleId: sampleData.id,
    Sample: sampleData,
    nodes,
    selectedParamIds,
    testItemIds,
    rootNode,
    testParams: params,
    sampleLevelNameArr,
    isNeedConclusion: useParamStandard.isNeedConclusion,
  }

  return data
}

/** 获取推荐评定/依据 */
function getRecommendStandard(key: 'basis' | 'standards') {
  const data = useSelectTestParam.data
  const result: string[] = []

  data.forEach((i) => {
    (i[key] || []).forEach((j) => {
      const arr = (j.publishCode || '').trim().split(' ')
      if (arr.length >= 2) {
        if (arr[0] && !result.includes(arr[0])) {
          result.push(arr[0])
        }
      }
    })
  })

  return result
}

const getRowSelection = function () {
  return {
    selectedRowKeys: selectedRowKeys.value,
    // preserveSelectedRowKeys: true,
    onChange: () => {
      useSelectTestParam.refreshSharePriceView()
      useSelectTestParam.refreshShareTestQuantityView()
      initTableHeight()
      if (showSelectedOnly.value === true) {
        filterData()
      }
    },
    onSelect: (row: ViewTestParamsItem, selected: boolean) => {
      useSelectTestParam.updateParamData(row.id, 'selected', selected)
    },
    onSelectAll: (selected: boolean) => {
      useSelectTestParam.data.forEach((item) => {
        useSelectTestParam.updateParamData(item.id, 'selected', selected)
      })
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.disabled,
    }),
  }
}

function customRow(record) {
  return {
    onClick: () => {
      const isCheck = useSelectTestParam.selectedRowKey.includes(record.id)
      useSelectTestParam.updateParamData(record.id, 'selected', !isCheck)
      useSelectTestParam.refreshSharePriceView()
      useSelectTestParam.refreshShareTestQuantityView()
      if (showSelectedOnly.value === true) {
        filterData()
      }
    },
  }
}

async function getList() {
  let testParamIds
  tableLoading.value = true

  if (!MainController.isAddPage && useTestParams.selectedRowKey.length > 0) {
    testParamIds = useTestParams.selectedRowKey
  }

  const res = await paramsApi({
    ...query.value,
    testParamIds,
  }).finally(() => {
    tableLoading.value = false
  })

  res.data.forEach((item) => {
    // 格式化规程数据
    useParamStandard.formatStandard(item)

    // 格式化价格下拉，若没有价格或只有一个共享价格，需要往里面加入一个参数为0的价格
    item.prices = item.prices || []

    if (
      item.prices.length === 0
      || (item.prices.length === 1 && item.prices[0].type === PRICE_TYPE.SHARE)
    ) {
      const emptyPrice = new ParamPriceItem()
      emptyPrice.id = EmptyPriceId
      emptyPrice.price = 0
      emptyPrice.type = PRICE_TYPE.PRICE
      emptyPrice.qualifier = '参数价格'
      item.prices.push(emptyPrice)
    }
  })

  useSelectTestParam.initData(res.data)

  // 处理回显数据
  mergeEditTestParams()
  // 刷新
  useSelectTestParam.refreshSharePriceView()
  useSelectTestParam.refreshShareTestQuantityView()
}

/** 回显已选参数 */
function mergeEditTestParams() {
  const testParams = useTestParams.selectedRows

  if (testParams && testParams.length > 0) {
    const cacheData = useSelectTestParam.cacheData

    cacheData.forEach((item) => {
      const selectedItem = testParams.find(i => item.id === i.id)

      if (selectedItem) {
        item.selected = true
        useSelectTestParam.updateParamData(item.id, 'selected', true)
        useSelectTestParam.updateParamData(item.id, 'selectedPriceId', selectedItem.selectedPriceId)
        useSelectTestParam.updateParamData(item.id, 'selectedPriceType', selectedItem.selectedPriceType)
        useSelectTestParam.updateParamData(item.id, 'price', selectedItem.price)
        useSelectTestParam.updateParamData(item.id, 'prices', selectedItem.prices)

        // 规程回显
        if (USING_RECOMMENDED_PARAMETER_STANDARD.value) {
          // 开启推荐规程逻辑时，直接用系统最新的配置关系，然后再从元数据中匹配已选项
          handleEditRelationStandards(item, selectedItem)
        }
        else {
          // 未开启推荐规程时，直接把元数据的规程跟接口规程合并就行
          const basic = mergeStandards(selectedItem.basis, item.basis)
          const standards = mergeStandards(selectedItem.standards, item.standards)

          useSelectTestParam.updateParamData(item.id, 'basis', basic)
          useSelectTestParam.updateParamData(item.id, 'standards', standards)

          useSelectTestParam.updateParamData(item.id, 'selectedBasis', basic.filter(i => i.selected).map(i => i.uniqKey))
          useSelectTestParam.updateParamData(item.id, 'selectedStandards', standards.filter(i => i.selected).map(i => i.uniqKey))
        }
      }
    })
  }
}

/**
 * 处理【推荐规程】逻辑下的规程回显
 * 开启推荐规程逻辑时，直接用系统最新的配置关系，然后再从元数据中匹配已选项
 * @param item 接口返回的参数对象
 * @param selectedItem 元数据中选中的参数对象
 */
function handleEditRelationStandards(item: ViewTestParamsItem, selectedItem: ViewTestParamsItem) {
  item.standards.forEach((standardItem) => {
    if (selectedItem.standards.filter(i => i.selected).find(i => i.uniqKey === standardItem.uniqKey)) {
      // 将评定标准设为选中
      standardItem.selected = true
    }
    else {
      standardItem.selected = false
    }
  })

  // 根据是否需要评定结果，构建依据下拉
  useParamStandard.updateStandardSelectedByNeedConclusion(item)

  // 加载对应的检测依据后，再匹配勾选项
  const selectedBasis = []
  item.basis.forEach((basisItem) => {
    if (selectedItem.basis.filter(i => i.selected).find(i => i.uniqKey === basisItem.uniqKey)) {
      selectedBasis.push(basisItem.uniqKey)
    }
  })

  useSelectTestParam.updateParamData(item.id, 'selectedBasis', selectedBasis)
}

/**
 * 合并规程
 * @param editStandards 回显的规程列表
 * @param newStandards 接口获取的规程列表
 */
function mergeStandards(editStandards: ParamStandardItem[], newStandards: ParamStandardItem[]) {
  const result: ParamStandardItem[] = [...editStandards]

  newStandards.forEach((item) => {
    const index = result.findIndex(i => i.uniqKey === item.uniqKey)
    if (index === -1) {
      item.selected = false
      result.push(item)
    }
  })

  return result
}

/**
 * 需要评定结果
 */
function onChangeIsNeedConclusion() {
  if (!USING_RECOMMENDED_PARAMETER_STANDARD.value) {
    return
  }

  if (!useParamStandard.isNeedConclusion && queryStanardUniqKey.value) {
    queryStanardUniqKey.value = undefined
    filterData()
  }

  useSelectTestParam.data.forEach((item) => {
    useParamStandard.updateStandardSelectedByNeedConclusion(item)
  })
}

/**
 * 应用参数打包
 */
async function onSelectParamPack(val) {
  if (showSelectedOnly.value) {
    showSelectedOnly.value = false
    filterData()
  }

  if (val) {
    const useParamPack = new UseParamPack(val, useParamStandard)

    tableLoading.value = true
    await useParamPack.init(useSelectTestParam.data).finally(() => {
      tableLoading.value = false

      if (!USING_RECOMMENDED_PARAMETER_STANDARD.value) {
        // 根据打包参数逻辑中设置的selected，重新选中规程
        useSelectTestParam.data.forEach((item) => {
          item.selectedStandards = []
          item.selectedBasis = []

          useSelectTestParam.setDefaultSelectedStandards(item)
        })
      }
    })
  }
}

/**
 * ## 快捷查询
 * @param isQueryStanard 是否为选择评定标准
 */
function filterData(isQueryStanard = false) {
  useSelectTestParam.localFilterData({
    queryParam: queryParam.value,
    queryStandard: queryStanardUniqKey.value,
    showSelectedOnly: showSelectedOnly.value,
  })

  useSelectTestParam.refreshSharePriceView()
  useSelectTestParam.refreshShareTestQuantityView()

  // 过滤规程时，将符合条件的评定标准默认勾选上
  if (USING_RECOMMENDED_PARAMETER_STANDARD.value && isQueryStanard === true && queryStanardUniqKey.value) {
    useSelectTestParam.data.forEach((item) => {
      item.basis = []
      item.selectedStandards = []
      item.selectedBasis = []

      const sItem = item.standards.find(i => i.uniqKey === queryStanardUniqKey.value)
      if (sItem) {
        item.selectedStandards = [sItem.uniqKey]
        useParamStandard.onSelectStandard(item, sItem.uniqKey)
      }
    })
  }
}

function queryReset() {
  queryParam.value = ''
  filterData()
}

/** 选择价格 */
function onSelectPrice(item: ViewTestParamsItem) {
  const { id, selectedPriceId, prices } = item
  const priceItem = prices.find(i => i.id === selectedPriceId)

  useSelectTestParam.updateParamData(id, 'price', priceItem.price)
  useSelectTestParam.updateParamData(id, 'selectedPriceType', priceItem.type)
  useSelectTestParam.updateParamData(id, 'priceType', priceItem.type)
}

/**
 * ## 选中高亮
 */
function selectedSearchActive() {
  const ids = useSelectTestParam.data.filter(d => d.isSearch).map(i => i.id)

  ids.forEach((id) => {
    useSelectTestParam.updateParamData(id, 'selected', true)
  })
}

// 样品节点变更时，更新参数列表
watch(() => props.sampleNode, (obj) => {
  useParamPackId.value = undefined
  paramPackList.value = []

  if (!obj) {
    resetPageState()
    return
  }

  query.value.sampleId = obj.id
  query.value.bigCategoryId = obj.categoryId
  resetPageState()
  getList()
  getParamPackList(obj.categoryId, obj.id)
})

// 选择规程
function handleAddStandard(ind: number, type: StandardType) {
  standardType.value = type
  dataIndex.value = ind

  // 规程配置
  if (USING_RECOMMENDED_PARAMETER_STANDARD.value) {
    settingStandardVisible.value = true
    return
  }

  // 规程新增
  standardVisible.value = true
}

// 应用推荐依据
function onUseRecommendBasis(row) {
  useSelectTestParam.data.forEach((item) => {
    useParamStandard.useRecommendBasis(item, row.key)
  })
}

// 应用推荐标准
function onUseRecommendStandards(row) {
  useSelectTestParam.data.forEach((item) => {
    useParamStandard.useRecommendStandards(item, row.key)
  })
}

// 同步选择规程数据
function handleAddStandardCallback(datas: StandardDatas[]) {
  const item = useSelectTestParam.data[dataIndex.value]

  if (datas.some(i => i.type !== standardType.value && i.type !== STANDARD_TYPE.ALL)) {
    Modal.confirm({
      title: '提示',
      content: `选择的数据中包含非${STANDARD_TYPE_DICT.getLabelByKey(standardType.value)}的数据，是否继续？`,
      onOk: () => {
        useParamStandard.addStandardSelected(item, standardType.value, datas)
        useSelectTestParam.updateStandardOptions()
      },
    })
  }
  else {
    useParamStandard.addStandardSelected(item, standardType.value, datas)
    useSelectTestParam.updateStandardOptions()
  }

  standardVisible.value = false
}

// 配置规程关联关系
// 配置保存后，读取配置信息，并更新参数规程信息
async function onSaveStandardSetting() {
  const item = useSelectTestParam.data[dataIndex.value]
  const res = await getSampleParamStandard({
    sampleId: sampleId.value as string,
    paramIds: [item.id],
  })

  if (item) {
    // 赋值最新的关联关系数据
    useSelectTestParam.data[dataIndex.value].criteria = res.data.criteria
    // 转换数据
    useParamStandard.convertCriteria(useSelectTestParam.data[dataIndex.value])
    // 根据转换后的数据，设置默认选中评定标准数据
    useSelectTestParam.setDefaultSelectedStandards(useSelectTestParam.data[dataIndex.value])
  }

  useSelectTestParam.updateStandardOptions()
}

// 添加附注 start-----------------
const visible = ref(false)
const noteLoading = ref(false)
const addNoteParamId = ref('')
const paramNote = ref('')
// 打开附注弹窗
function addNote(node: ViewTestParamsItem) {
  addNoteParamId.value = node.id
  paramNote.value = node.paramNote || ''
  visible.value = true
}
// 保存附注信息
async function onSaveNote(val: string) {
  noteLoading.value = true
  await addParamNoteApi({
    id: addNoteParamId.value,
    paramNote: val,
  }).finally(() => {
    noteLoading.value = false
  })
  visible.value = false

  useSelectTestParam.updateParamData(addNoteParamId.value, 'paramNote', val)

  paramNote.value = ''
  addNoteParamId.value = ''
  message.success('操作成功')
}
// 添加附注 end-----------------

/**
 * ## 切换专业/简易模式
 * @description 是否为简易模式，变量定义在父组件SelectSampleParam.vue中
 */
const isSimpleMode = ref(inject('isSimpleMode') as boolean)
function changeMode() {
  isSimpleMode.value = !isSimpleMode.value
  top.localStorage.setItem('isSimpleMode', JSON.stringify(isSimpleMode.value))
  resetPageState()
}

function resetPageState() {
  queryParam.value = ''
  queryStanardUniqKey.value = undefined
  showSelectedOnly.value = false
  useParamPackId.value = undefined

  // 清空缓存的参数列表
  useSelectTestParam.initData([])
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
