<template>
  <div class="h-full flex flex-col gap-2">
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :entity="entity"
        :data-source="dataSource"
        :table-height="tableHeight"
        :paginations="false"
        :loading="loading"
        :custom-row="getCustomRow()"
        :row-selection="isTerm || isConsignLayout ? undefined : getRowSelection()"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="record.isGroupHeader">
            <template v-if="column.dataIndex === 'fieldName'">
              {{ record.groupName }}
            </template>
          </template>
          <!-- 新增行 -->
          <template v-else-if="record.isAdd">
            <template v-if="column.dataIndex === 'target'">
              <a-select v-model:value="record.target" class="w-full" placeholder="请选择" @click.stop>
                <a-select-option v-for="d in FIELD_SOURCE_DICT" :key="d.key" :value="d.key">
                  {{ d.label }}
                </a-select-option>
              </a-select>
            </template>
            <a-input
              v-else
              v-model:value="record[column.dataIndex as string]"
              placeholder="请输入"
              @click.stop
              @blur="handleBlur(record as IndustryConfig, column.dataIndex as string)"
            />
          </template>
          <!-- 系统字段 -->
          <template v-else>
            <template v-if="column.dataIndex === 'fieldDisplayName'">
              <a-input v-if="module !== BUSINESS_SCOPE.CONSIGN" v-model:value="record.fieldDisplayName" placeholder="请输入" @click.stop />
            </template>
            <template v-else-if="column.dataIndex === 'formType'">
              <a-select v-model:value="record.formType" class="w-full" placeholder="请选择" @click.stop>
                <a-select-option v-for="d in dynamicFormTypeDict" :key="d.value" :value="d.value">
                  {{ d.label }}
                </a-select-option>
              </a-select>
            </template>
            <template v-else-if="column.dataIndex === 'dataFrom'">
              <template v-if="isShowSource(record)">
                <a-input
                  :value="dataFormLabel(record.dataFrom)"
                  placeholder="设置数据来源"
                  readonly
                  @click.stop="handleSetDataSource(record as IndustryConfig)"
                />
              </template>
              <template v-else>
                --
              </template>
            </template>
            <template v-else-if="column.dataIndex === 'defaulted'">
              <div @click.stop>
                <a-switch v-model:checked="record.defaulted" />
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'required'">
              <div @click.stop>
                <a-switch v-model:checked="record.required" :disabled="disabledEditRequired[record.fieldCode]" />
              </div>
            </template>
          </template>
        </template>
      </IlisTable>
    </div>
    <a-space v-if="module !== BUSINESS_SCOPE.CONSIGN && isDev">
      <a-button type="primary" class="!px-8" @click="handleAdd">
        新增
      </a-button>
      <span>名称和属性均存在时才保存该行数据</span>
    </a-space>
  </div>
</template>

<script setup lang='ts'>
import type { IndustryListEntity } from '../IndustryConfigEntity'
import type { IndustryConfig } from '../interface'
import type { IDataFrom } from './ConfigSource.vue'
import { cloneDeep } from '@unovis/ts'
import { message } from 'ant-design-vue'
import { dynamicFormTypeDict } from '~/anyThing/components/input/customIndex'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { industryFieldApi, industryFieldConfigApi } from '../api'
import { FIELD_SOURCE_DICT, FIELD_SOURCE_MAP, OPTIONS_DATA_SOURCE_DICT } from '../constants'
import { BUSINESS_SCOPE, FIELD_SOURCE, OPTIONS_DATA_SOURCE } from '../enum'
import ConfigSource from './ConfigSource.vue'

const props = defineProps<{
  entity: any
  industryData: IndustryListEntity
  module: BUSINESS_SCOPE
}>()

const isDev = __DEV__
const disabledEditRequired = ref<Record<string, boolean>>({})
const configDatas = ref<any[]>([])
/** 是否为‘领域术语’配置：该模块只配置显示名称，默认都显示，且不能取消勾选 */
const isTerm = computed(() => props.module === BUSINESS_SCOPE.TERMINOLOGY)
/** 是否为委托布局配置 */
const isConsignLayout = computed(() => props.module === BUSINESS_SCOPE.CONSIGN)

/** 获取字段库 */
const {
  loading,
  dataSource,
  selectedRowKeys,
  tableBoxRef,
  tableHeight,
  getList,
} = useTableHooks<any>({
  api: industryFieldApi,
  isPagination: false,
  immediate: false,
  payload: {
    module: props.module,
  },
  responseDataTransform(res: any) {
    const rows = mergeConfigAndFieldData(res)
    // 按字段来源分组显示
    return {
      rows: sortByFieldSource(rows),
      total: rows.length,
    }
  },
})

/** 新增行 */
function handleAdd() {
  const newField: IndustryConfig = {
    id: '',
    fieldCode: '',
    fieldName: '',
    fieldDisplayName: '',
    formType: EFormItemDynamicType.INPUT,
    dataFrom: OPTIONS_DATA_SOURCE.NONE,
    target: FIELD_SOURCE.CONSIGN,
    scope: props.module,
    config: undefined,
    defaulted: false,
    required: false,
    selected: false,
    isAdd: true,
    sort: 9999,
  }
  dataSource.value.push(newField)
  nextTick(() => {
    const body = tableBoxRef.value?.querySelector('.ant-table-body') as HTMLElement
    body.scrollTop = body.scrollHeight
  })
}

/** 验证重复 */
function validRepeat(key: string, field: string) {
  return dataSource.value.filter((d: any) => d[key] && d[key].toLowerCase() === field.toLowerCase()).length > 1
}

/** 行重复验证 */
function handleBlur(row: IndustryConfig, field: string) {
  if (field === 'fieldName' && validRepeat('fieldName', row.fieldName)) {
    row.fieldName = ''
    message.error('名称不能重复')
  }
  if (field === 'fieldCode' && validRepeat('fieldCode', row.fieldCode)) {
    row.fieldCode = ''
    message.error('字段属性不能重复')
  }
}

// 自定义行渲染，为分组行添加特殊样式
function getCustomRow() {
  return (record: any) => {
    if (record.isGroupHeader) {
      return {
        style: {
          fontWeight: 'bold',
          backgroundColor: '#f5f5f5',
        },
      }
    }
    return {
      onClick: () => {
        const ind = selectedRowKeys.value.findIndex(d => d === record.id)
        if (ind === -1)
          selectedRowKeys.value.push(record.id)
        else
          selectedRowKeys.value.splice(ind, 1)
      },
    }
  }
}

// 自定义行选择配置，分组行不可选择
function getRowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedRowKeysVal: (string | number)[], _selectedRows: any[]) => {
      selectedRowKeys.value = selectedRowKeysVal as string[]
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.isGroupHeader,
      // 隐藏分组行的复选框
      class: record.isGroupHeader ? 'hidden-checkbox' : '',
    }),
  }
}

function dataFormLabel(key: OPTIONS_DATA_SOURCE) {
  if (key === OPTIONS_DATA_SOURCE.NONE) {
    return ''
  }
  return OPTIONS_DATA_SOURCE_DICT.find(d => d.key === key)?.label
}
/** 按字段来源分组显示 */
function sortByFieldSource(fields: IndustryConfig[]) {
  if (isConsignLayout.value) {
    return fields
  }
  // 按target字段分组
  const groupedFields: Record<string, IndustryConfig[]> = {}
  fields.forEach((field) => {
    const target = field.target || ''
    if (!groupedFields[target]) {
      groupedFields[target] = []
    }
    groupedFields[target].push(field)
  })

  // 构造结果数组，插入分组标题行
  const result: any[] = []
  Object.keys(groupedFields).forEach((target) => {
    // 添加分组标题行
    result.push({
      id: `group_${target}`,
      isGroupHeader: true,
      groupName: FIELD_SOURCE_MAP[target as keyof typeof FIELD_SOURCE_MAP] || '其他',
      target,
    })

    // 添加该组的所有字段
    result.push(...groupedFields[target])
  })
  return result
}

/** 合并配置和字段库数据 */
function mergeConfigAndFieldData(fields: IndustryConfig[]) {
  const configObj: Record<string, IndustryConfig> = {}
  const selRows: string[] = []
  for (let i = 0; i < configDatas.value.length; i++) {
    const conf = configDatas.value[i]
    configObj[conf.fieldCode] = conf
  }
  fields.forEach((d: IndustryConfig) => {
    d.selected = false
    if (d.required) {
      disabledEditRequired.value[d.fieldCode] = true
    }
    if (!d.config) {
      d.dataFrom = OPTIONS_DATA_SOURCE.NONE
    }
    const conf = configObj[d.fieldCode]
    if (!conf)
      return

    d.configId = conf.id
    d.fieldDisplayName = conf.fieldDisplayName || ''
    d.formType = conf.formType
    d.dataFrom = conf.dataFrom
    d.config = conf.config
    d.defaulted = conf.defaulted
    d.required = conf.required
    d.sort = conf.sort

    if (conf.selected)
      selRows.push(d.id)
  })
  selectedRowKeys.value = selRows
  return fields
}

/** 按模块获取字段配置 */
async function getFieldConfig() {
  loading.value = true
  const { data } = await industryFieldConfigApi({
    industryId: props.industryData.id,
    module: props.module,
  }).finally(() => {
    loading.value = false
  })
  configDatas.value = data
}

async function initData() {
  await getFieldConfig()
  await getList()
}
initData()

function isShowSource(record: any) {
  const { INPUT, INPUT_SELECTOR, SELECT, SELECT_INPUT, SELECT_MULTIPLE, RADIO, CHECKBOX, TREE_SELECT } = EFormItemDynamicType
  return [INPUT, INPUT_SELECTOR, SELECT, SELECT_INPUT, SELECT_MULTIPLE, RADIO, CHECKBOX, TREE_SELECT].includes(record.formType)
}

async function handleSetDataSource(record: IndustryConfig) {
  const dataForm: IDataFrom = await AnyDialogHelper.showModel(ConfigSource, record)
  record.dataFrom = dataForm.dataFrom
  record.config = dataForm.config
}

function saveData(): IndustryConfig[] {
  const keys = selectedRowKeys.value
  // 过滤掉分组行，只保存真实的数据行
  const actualData = dataSource.value.filter((d: any) => !d.isGroupHeader && d.fieldName && d.fieldCode)
  const datas = cloneDeep(actualData)
  datas.forEach((d) => {
    d.selected = isTerm.value ? true : keys.includes(d.id)
    d.industryId = props.industryData.id
    d.fieldLabId = d.id || ''
    d.id = d.configId || ''
    if (!isShowSource(d)) {
      d.dataFrom = OPTIONS_DATA_SOURCE.NONE
      d.config = undefined
    }
    delete d.configId
  })
  return datas
}

defineExpose({
  saveData,
})
</script>

<style scoped>
:deep(.ant-table-row[data-row-key^="group_"]) {
  font-weight: bold;
  background-color: #ccc;
}

:deep(.ant-table-row[data-row-key^="group_"] .ant-table-cell) {
  border-bottom: 1px solid #e8e8e8;
}

/* 隐藏分组行的复选框 */
:deep(.hidden-checkbox .ant-checkbox) {
  display: none;
}

/* 分组行首列显示为"-" */
:deep(.hidden-checkbox .ant-checkbox-wrapper::after) {
  content: "-";
  display: inline-block;
  text-align: center;
  width: 16px;
}
</style>
