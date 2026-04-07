<template>
  <a-table
    v-bind="$props"
    v-model:expanded-row-keys="expandedRowKeys"
    :scroll="{
      y: tableHeight,
      x: tableWidth,
    }"
    bordered
    :columns="columns"
    :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : '')"
    @change="onChange"
    @resize-column="handleResizeColumn"
  >
    <template v-for="(_value, key) in slots" :key="key" #[key]="slotProps">
      <slot v-if="isSlotWithProps(key)" :name="key" v-bind="slotProps" />
      <slot v-else :name="key" />
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import type { Table, TableProps } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import type { ClassConstructor } from '~/anyThing/types/ClassConstructor'
import type { GetComponentSlots } from '~/anyThing/types/GetComponentSlots'
import type { ICustomColumns } from '~/hooks/useTableHooks'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { useIndustryStore } from '~/store/industryStore'

interface Props<T> extends TableProps {
  /** # 配置实体 */
  entity: ClassConstructor<T>
  /** # 表格高度 */
  tableHeight?: number | string
  /** # 表格宽度 */
  tableWidth?: number | string
  /** # 是否显示序号 */
  showIndex?: boolean
  /** # 要展示的字段列表（只会从本来要展示的字段列表中取值，不会新增字段） */
  fieldList?: string[]
  /** # 字段排序参考 */
  fieldOrder?: string[]
  /** # 自定义列配置（可通过useTableHooks获取） */
  customColumns?: ICustomColumns[]
  /** # 额外列配置 */
  extraColumns?: ICustomColumns[]
  /** # 是否可调整列宽 */
  resizable?: boolean

  /**
   * # 表格行的类名
   */
  rowClassName?: (record: any, index: number) => string
}

defineOptions({
  // inheritAttrs: false,
})

const props = withDefaults(defineProps<Props<AnyBaseModel>>(), {
  showHeader: true,
  showExpandColumn: true,
  showSorterTooltip: true,
  childrenColumnName: 'children',
  indentSize: 15,
  rowKey: 'key',
  size: 'middle',
  sortDirections: () => ['ascend', 'descend'],
  locale: () => ({
    filterConfirm: '确定',
    filterReset: '重置',
  }),
  rowClassName: (_row: any, index: number) => (index % 2 === 1 ? 'table-striped' : ''),
})

const slots = defineSlots<GetComponentSlots<InstanceType<typeof Table>>>()

const expandedRowKeys = defineModel('expandedRowKeys', {
  type: Array as PropType<Key[]>,
  default: () => [],
})

const { term } = useIndustryStore()

// eslint-disable-next-line new-cap
const instance = new props.entity()

const widthMap = ref<Record<string, number>>({})

/** # 判断插槽是否需要参数 */
function isSlotWithProps(slotName: string): boolean {
  // 这些插槽不需要参数，应该直接使用
  const noPropsSlots = ['emptyText', 'title', 'footer', 'summary']
  return !noPropsSlots.includes(slotName)
}

/** # 表格列配置 */
const columns = computed(() => {
  // 如果外部直接传入列配置，直接返回
  if (props.columns) {
    return props.columns
  }

  // 获取表格字段配置和列表
  const config = instance.getTableFieldConfigObj()
  const configFieldList = instance.getTableFieldList()

  // 处理字段列表的筛选和排序
  const processedFieldList = processFieldList(config, configFieldList)

  // 生成列配置
  const generatedColumns = processedFieldList.map(field =>
    createColumnConfig(field, config, configFieldList),
  )

  // 添加序号列
  const finalColumns = props.showIndex
    ? [createIndexColumn(), ...generatedColumns]
    : generatedColumns

  return finalColumns
})

/** # 处理字段列表的筛选和排序 ⚙️ */
function processFieldList(config: Record<string, any>, configFieldList: string[]): string[] {
  let fieldList = [...configFieldList]

  // 通过自定义列筛选配置的列对tableFieldList过滤
  if (props.customColumns?.length) {
    const alwaysColumns = configFieldList.filter(item => config[item]?.isAlways)
    const customColumnsFields = props.customColumns.map(i => i.dataIndex)
    fieldList = Array.from(new Set([...customColumnsFields, ...alwaysColumns]))
  }

  // 将手动传入的额外列配置的字段并入
  if (props.extraColumns?.length) {
    fieldList = [...fieldList, ...props.extraColumns.map(i => i.dataIndex)]
  }

  // 过滤出要外部传入指定展示的字段
  if (props.fieldList?.length) {
    fieldList = fieldList.filter(item => props.fieldList!.includes(item))
  }

  // 按传入的顺序排序
  if (props.fieldOrder?.length) {
    fieldList = AnyDataTransformHelper.sortByArray(fieldList, props.fieldOrder)
  }

  return fieldList
}

/** # 创建列配置 ⚙️ */
function createColumnConfig(field: string, config: Record<string, any>, configFieldList: string[]) {
  // 配置字段列
  if (configFieldList.includes(field)) {
    return createConfigFieldColumn(field, config)
  }

  // 自定义列
  const customColumn = props.customColumns?.find(i => i.dataIndex === field)
  if (customColumn) {
    return createCustomColumn(field, customColumn)
  }

  // 额外列
  const extraColumn = props.extraColumns?.find(i => i.dataIndex === field)
  if (extraColumn) {
    return createExtraColumn(field, extraColumn)
  }

  // 如果字段不属于任何已知类型，返回一个默认的列配置
  return {
    title: field,
    dataIndex: field,
    key: field,
    width: widthMap.value[field] || 150,
    ellipsis: true,
    resizable: props.resizable,
  }
}

/** # 创建配置字段列 ⚙️ */
function createConfigFieldColumn(field: string, config: Record<string, any>) {
  const fieldConfig = config[field] || {}
  const dictionaryArray = instance.getFieldDictionaryArray(field)

  // 获取自定义渲染函数
  const customRender = getCustomRender(fieldConfig, dictionaryArray)

  // 表格列名优先以自定义列配置的title为准
  const customColumn = props.customColumns?.find(i => i.dataIndex === field)

  return {
    title: customColumn?.title || term(instance.getTableFieldLabel(field)),
    dataIndex: field,
    key: field,
    ellipsis: fieldConfig?.ellipsis,
    width: widthMap.value[field] || fieldConfig?.width || 150,
    sorter: fieldConfig?.sorter,
    fixed: fieldConfig?.fixed,
    align: fieldConfig?.align,
    resizable: props.resizable,
    ...(customRender ? { customRender } : {}),
  }
}

/** # 创建自定义列 ⚙️ */
function createCustomColumn(field: string, customColumn: ICustomColumns) {
  return {
    title: term(customColumn.title),
    dataIndex: field,
    key: field,
    width: widthMap.value[field] || 150,
    ellipsis: false,
    resizable: props.resizable,
    customRender: ({ record, text }: { record: any, text: string }) => {
      const data = record.customizeValues?.find((i: ICustomProperties) => i.columnId === field)
      return data?.columnValue || text || ''
    },
  }
}

/** # 创建额外列 ⚙️ */
function createExtraColumn(field: string, extraColumn: ICustomColumns) {
  return {
    title: term(extraColumn.title),
    dataIndex: field,
    key: field,
    width: widthMap.value[field] || extraColumn.width || 150,
    ellipsis: extraColumn.ellipsis,
    customRender: extraColumn.customRender,
    resizable: props.resizable,
  }
}

/** # 创建序号列 ⚙️ */
function createIndexColumn() {
  return {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    ellipsis: true,
    width: 50,
    sorter: false,
    fixed: 'left',
    align: 'center' as const,
    resizable: false,
    customRender: ({ index }: { index: number }) => index + 1,
  }
}

/** # 获取自定义渲染函数 ⚙️ */
function getCustomRender(fieldConfig: any, dictionaryArray: any) {
  // 1.配置有自定义渲染函数，则使用自定义渲染函数
  if (fieldConfig.customRender) {
    return fieldConfig.customRender
  }

  // 2.检查字段是否有字典数组，有则使用字典数组
  if (dictionaryArray) {
    return ({ text }: { text: string }) => dictionaryArray.getLabelByKey(text)
  }

  // 3.判断是否为日期类型，是则使用日期格式化函数
  if (fieldConfig.dateFormat) {
    return ({ text }: { text: string }) => AnyDateTimeHelper.format(text, fieldConfig.dateFormat)
  }

  return null
}

/** # 处理列宽调整 */
function handleResizeColumn(width: number, column: any) {
  widthMap.value[column.dataIndex] = width
}

defineExpose({
  columns,
})
</script>

<style scoped>
:deep(.ant-table-body){
  border-right: 1px solid var(--colorSplit);
  border-bottom: 1px solid var(--colorSplit);
}
:deep(.table-striped) td {
  background-color: var(--colorFillAlter);
}
:deep(.ant-table-row-expand-icon){
  color: #AFAFB6 !important;
  border: 1px solid #AFAFB6 !important;
}
</style>
