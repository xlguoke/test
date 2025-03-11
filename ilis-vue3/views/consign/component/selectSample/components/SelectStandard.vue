<template>
  <a-modal
    v-model:open="open"
    title="选择规程"
    width="80%"
    :mask-closable="false"
    centered
    destroy-on-close
    @cancel="handleCancel"
  >
    <a-row class="mt-4" :gutter="16" style="min-height: 420px;">
      <a-col :span="5">
        <a-tabs
          v-model:active-key="selectedTestParamId"
          tab-position="left"
          animated
          @change="onTabTestParam"
        >
          <a-tab-pane
            v-for="item in testParams"
            :key="item.id"
            :tab="item.displayName"
            class="overflow-ellipsis overflow-hidden whitespace-nowrap"
          />
        </a-tabs>
      </a-col>
      <a-col :span="19">
        <a-space class="mb-4">
          <a-button :disabled="!selectedTestParamId" @click="setAddStandardVisible(true)">
            引用规程库
          </a-button>
          <a-button :disabled="!selectedTestParamId" :loading="quoteLoading" @click="quoteNewStandards">
            引用最新规程
          </a-button>
        </a-space>
        <a-table
          size="small"
          :columns="columns"
          :data-source="standardList"
          :pagination="false"
          bordered
          :scroll="{ y: 330 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'baseStandardUseType1'">
              <a-checkbox :checked="getCheckState(record, STANDARD_TYPE.BASIS)" @click="onSelectStandard(record.uniqKey, STANDARD_TYPE.BASIS)" />
            </template>
            <template v-if="column.dataIndex === 'baseStandardUseType2'">
              <a-checkbox :checked="getCheckState(record, STANDARD_TYPE.STANDARD)" @click="onSelectStandard(record.uniqKey, STANDARD_TYPE.STANDARD)" />
            </template>
            <template v-if="column.dataIndex === 'clauseCode'">
              <a-input v-model:value="record.clauseCode" placeholder="请输入" />
            </template>
            <template v-if="column.dataIndex === 'executeDate'">
              {{ record.executeDate ? dayjs(record.executeDate).format('YYYY-MM-DD') : "" }}
            </template>
            <template v-if="column.dataIndex === 'Action'">
              <a-space>
                <ReadOutlined style="font-size: 22px;color:#1677ff;" title="查看详情" @click="onCheckDetail(record)" />
                <a-popover v-model:open="record._popover" title="将当前规程应用到以下参数" trigger="click">
                  <template #content>
                    <a-space direction="vertical">
                      <a-checkbox v-model:checked="checkState.checkAll" :indeterminate="checkState.indeterminate" @change="onCheckAllChange">
                        全部
                      </a-checkbox>
                      <a-checkbox-group v-model:value="checkState.checkedList">
                        <a-space direction="vertical">
                          <div v-for="item in testParams.filter(i => i.id !== selectedTestParamId)" :key="item.id" class="pl-4">
                            <a-checkbox :value="item.id">
                              {{ item.displayName }}
                            </a-checkbox>
                          </div>
                        </a-space>
                      </a-checkbox-group>
                      <a-space>
                        <a-button size="small" type="primary" @click="add2OtherParam(record)">
                          确定
                        </a-button>
                        <a-button size="small" @click="record._popover = false">
                          取消
                        </a-button>
                      </a-space>
                    </a-space>
                  </template>
                  <CopyOutlined style="font-size: 20px;color:#1677ff;" title="应用到其他参数" @click="onUse2OtherParam(record)" />
                </a-popover>
                <DeleteOutlined style="font-size: 20px;color:#1677ff;" title="取消引用" @click="onDel(record)" />
              </a-space>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>

    <template #footer>
      <a-button @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="handleOk">
        确定
      </a-button>
    </template>

    <!-- 选择规程 -->
    <SelectedStandard v-model:open="addStandardVisible" @select="handleAddStandardCallback" />
  </a-modal>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import { CopyOutlined, DeleteOutlined, ReadOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type { StandardType } from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import { ParamStandardItem } from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import { STANDARD_TYPE } from '~/types/standard.ts'
import type { StandardDatas } from '~/views/unit-config/standard'
import { SelectedStandard } from '~/views/unit-config/standard'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type {
  ParamStandardUseParams,
} from '~/views/consign/component/selectSample/api.ts'
import {
  paramStandardUse,
  quoteNewestStandard,
} from '~/views/consign/component/selectSample/api.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

/** 选择规程构建的视图数据 */
export interface SelectStandardDataSource {
  [key: string]: ParamStandardItem[]
}

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open'])

// 检测参数
const useTestParams = inject('useTestParams') as UseTestParams
// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo

const quoteLoading = ref(false)

const submitLoading = ref(false)

const columns: ColumnsType = [
  { title: '试验依据', dataIndex: 'baseStandardUseType1', width: '10%', align: 'center' },
  { title: '评定标准', dataIndex: 'baseStandardUseType2', width: '10%', align: 'center' },
  { title: '规程名称', dataIndex: 'baseStandardName', width: '25%' },
  { title: '颁布号', dataIndex: 'publishCode', width: '15%' },
  { title: '执行时间', dataIndex: 'executeDate', width: '15%' },
  { title: '条款号', dataIndex: 'clauseCode', width: '15%' },
  { title: '操作', dataIndex: 'Action', width: '10%', align: 'center' },
]

// 应用到其他参数控制
const checkState = reactive({
  indeterminate: false,
  checkAll: false,
  checkedList: [],
})

const open = computed(() => props.open)

const [addStandardVisible, setAddStandardVisible] = useStateHooks(false)

// 选择的参数
const testParams = ref<ViewTestParamsItem[]>([])

const selectedTestParamId = ref('')

// 构建的数据对象，用来存储规程列表及选中状态
const dataSource = ref<SelectStandardDataSource>({})

const standardList = ref<ParamStandardItem[]>([])

watch(() => checkState.checkedList, (val) => {
  checkState.indeterminate = !!val.length && val.length < testParams.value.length
  checkState.checkAll = val.length === testParams.value.length
})

watch(open, (val) => {
  if (val) {
    init()
  }
  else {
    handleCancel()
  }

  emits('update:open', val)
})

function init() {
  const data: ViewTestParamsItem[] = JSON.parse(JSON.stringify(useTestParams.selectedRows))
  testParams.value = data

  if (useTestParams.USING_RECOMMENDED_PARAMETER_STANDARD) {
    const standardRelationMap = useTestParams.useParamStandard.standardRelationMap
    const allStandardList = useTestParams.useParamStandard.allStandardList
    const allBasisList = useTestParams.useParamStandard.allBasisList

    data.forEach((item) => {
      const mapItem = standardRelationMap[item.id] || {}

      for (const standardKey in mapItem) {
        if (!item.standards.find(i => i.uniqKey === standardKey)) {
          const sItem = allStandardList.find(i => i.uniqKey === standardKey)

          if (sItem) {
            item.standards.push({
              ...sItem,
              selected: false,
            })
          }
        }

        mapItem[standardKey].basis.forEach((j) => {
          if (!item.basis.find(i => j.uniqKey === i.uniqKey)) {
            const sItem = allBasisList.find(i => i.uniqKey === j.uniqKey)

            if (sItem) {
              item.basis.push({
                ...sItem,
                selected: false,
              })
            }
          }
        })
      }
    })
  }

  data.forEach((item) => {
    dataSource.value[item.id] = getCurrentStandard(item)
  })

  if (data.length > 0) {
    selectedTestParamId.value = data[0].id
    onTabTestParam()
  }
}

/**
 * 从当前使用的规程数据中构建规程列表
 * 逻辑：将参数列表界面上的basis和standards合并为一个规程列表，且通过baseStandardUseType这个字段标记选中关系
 */
function getCurrentStandard(item: ViewTestParamsItem) {
  const criterion: ParamStandardItem[] = []

  item.basis.forEach((ib) => {
    if (ib.selected) {
      ib.baseStandardUseType = STANDARD_TYPE.BASIS
    }
    else {
      ib.baseStandardUseType = STANDARD_TYPE.NONE
    }
    criterion.push(ib)
  })

  item.standards.forEach((ib) => {
    const sameItem = criterion.find(j => j.uniqKey === ib.uniqKey)
    if (sameItem) {
      if (ib.selected && sameItem.baseStandardUseType === STANDARD_TYPE.BASIS) {
        sameItem.baseStandardUseType = STANDARD_TYPE.ALL
      }
      else if (ib.selected && sameItem.baseStandardUseType === STANDARD_TYPE.NONE) {
        sameItem.baseStandardUseType = STANDARD_TYPE.STANDARD
      }
    }
    else {
      if (ib.selected) {
        ib.baseStandardUseType = STANDARD_TYPE.STANDARD
      }
      else {
        ib.baseStandardUseType = STANDARD_TYPE.NONE
      }
      criterion.push(ib)
    }
  })

  return criterion
}

// 获取选中状态
function getCheckState(item: ParamStandardItem, type: STANDARD_TYPE) {
  if (item.baseStandardUseType === type || item.baseStandardUseType === STANDARD_TYPE.ALL) {
    return true
  }

  return false
}

// 切换参数
function onTabTestParam() {
  standardList.value = dataSource.value[selectedTestParamId.value]
}

// 选择使用规程
function onSelectStandard(uniqKey: string, type: StandardType) {
  const item = standardList.value.find(i => i.uniqKey === uniqKey)
  if (item.baseStandardUseType === STANDARD_TYPE.ALL) {
    item.baseStandardUseType = type === STANDARD_TYPE.BASIS ? STANDARD_TYPE.STANDARD : STANDARD_TYPE.BASIS
  }
  else {
    if (item.baseStandardUseType === type) {
      item.baseStandardUseType = STANDARD_TYPE.NONE
    }
    else {
      item.baseStandardUseType = item.baseStandardUseType === STANDARD_TYPE.NONE ? type : STANDARD_TYPE.ALL
    }
  }
}

// 引用规程
function handleAddStandardCallback(datas: StandardDatas[]) {
  datas.forEach((item) => {
    const sameItem = standardList.value.find(i => i.uniqKey === item.uniqueKey)
    if (!sameItem) {
      const dataObj = new ParamStandardItem()
      dataObj.id = item.id
      dataObj.baseStandardId = item.standardId
      dataObj.baseStandardName = item.standardName
      dataObj.publishCode = item.publishCode
      dataObj.baseStandardType = item.sourceType as StandardType
      dataObj.uniqKey = item.uniqueKey
      dataObj.expireDate = item.expireDate
      dataObj.executeDate = item.executeDate
      // 产品说引用的规程默认不选中
      dataObj.baseStandardUseType = STANDARD_TYPE.NONE

      standardList.value.push(dataObj)
    }
  })

  setAddStandardVisible(false)
}

// 查看详情
function onCheckDetail(item: ParamStandardItem) {
  window.open(`http://www.doc88.com/tag/${item.baseStandardName}`)
}

// 取消引用
function onDel(item: ParamStandardItem) {
  Modal.confirm({
    title: '提示',
    content: '确认删除选择的数据？',
    onOk() {
      const index = standardList.value.findIndex(i => i.uniqKey === item.uniqKey)
      if (index !== -1) {
        standardList.value.splice(index, 1)
      }
    },
  })
}

// 应用到其他参数 全选
function onCheckAllChange(e: any) {
  Object.assign(checkState, {
    checkedList: e.target.checked ? testParams.value.map(i => i.id) : [],
    indeterminate: false,
  })
}

// 应用到其他参数
function onUse2OtherParam(item) {
  checkState.checkAll = false
  checkState.checkedList = []
  checkState.indeterminate = false

  item._popover = true
}

// 应用到其他参数
function add2OtherParam(item: ParamStandardItem) {
  const checkedList = checkState.checkedList

  if (!checkedList.length) {
    message.warning('请选择参数！')
    return
  }

  item._popover = false

  for (const key in dataSource.value) {
    if (key !== selectedTestParamId.value && checkedList.includes(key)) {
      const standards = dataSource.value[key] || []

      // 存在相同规程，做覆盖处理
      const sameItem: ParamStandardItem = standards.find(i => i.uniqKey === item.uniqKey)
      if (sameItem) {
        sameItem.baseStandardUseType = item.baseStandardUseType
        sameItem.clauseCode = item.clauseCode
      }
      else {
        standards.push({ ...item })
      }
    }
  }

  message.success('操作成功！')
}

// 引用最新规程
async function quoteNewStandards() {
  quoteLoading.value = true
  const hideLoading = message.loading('正在引用最新规程，请稍等...')
  const res = await quoteNewestStandard({
    paramId: selectedTestParamId.value,
    sampleId: useBasicInfo.data.testUnitTestSampleId,
  }).finally(() => {
    hideLoading()
    quoteLoading.value = false
  })

  const data = res.data

  data.forEach((i: ParamStandardItem) => {
    if (!standardList.value.find(j => j.uniqKey === i.uniqKey)) {
      i.baseStandardUseType = STANDARD_TYPE.NONE
      standardList.value.push(i)
    }
  })
}

// 取消
function handleCancel() {
  emits('update:open', false)
  testParams.value = []
  selectedTestParamId.value = ''
  standardList.value = []
  dataSource.value = {}
  submitLoading.value = false
  quoteLoading.value = false
}

async function saveUse() {
  const hide = message.loading('数据保存中...')
  submitLoading.value = true

  const formData: ParamStandardUseParams[] = []
  for (const key in dataSource.value) {
    const standards: ParamStandardItem[] = dataSource.value[key]
    formData.push({
      paramId: key,
      sampleId: useBasicInfo.data.testUnitTestSampleId,
      standards: standards.map(j => ({
        id: j.id,
        standardId: j.baseStandardId,
        clauseCode: j.clauseCode,
        executeDate: j.executeDate,
        expireDate: j.expireDate,
        publishCode: j.publishCode,
        standardName: j.baseStandardName,
        uniqKey: j.uniqKey,
        type: j.baseStandardUseType,
      })),
    })
  }

  await paramStandardUse(formData).finally(() => {
    submitLoading.value = false
    hide()
  })
}

// 提交
const handleOk = async function () {
  useTestParams.updateUseStandards(dataSource.value)
  await saveUse()
  handleCancel()
}
</script>

<style scoped>
:deep(.ant-tabs-nav) {
  width: 100%;
}

:deep(.ant-tabs) {
  height: 420px;
  overflow-y: auto;
}

:deep(.ant-tabs-tab-btn) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}
</style>
