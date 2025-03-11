<template>
  <a-table
    v-model:expandedRowKeys="expandedRowKeys"
    expand-row-by-click
    :row-key="rowKey"
    :loading="loading"
    :data-source="dataSource"
    :pagination="pagination"
    :row-selection="rowSelection"
    :custom-row="customRow"
    :row-class-name="rowClassName"
    :columns="columns"
    :scroll="{
      y: tableHeight,
      x: tableWidth,
    }"
    @change="onChange"
  >
    <template #headerCell="{ column, title }">
      <slot
        name="headerCell"
        :title="title"
        :column="column"
      ></slot>
    </template>
    <template #bodyCell="{ column, record, text, index }">
      <slot
        name="bodyCell"
        :record="record"
        :column="column"
        :text="text"
        :index="index"
      ></slot>
    </template>
    <template v-if="$slots.expandedRowRender" #expandedRowRender="{ record, index, expanded }">
      <slot
        name="expandedRowRender"
        :record="record"
        :index="index"
        :expanded="expanded"
      ></slot>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import type { TableProps } from 'ant-design-vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import type { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import type { ClassConstructor } from '~/anyThing/types/ClassConstructor'
import type { ICustomColumns } from '~/hooks/useTableHooks'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'

interface Props<T> extends TableProps {
  /**
   * # 配置实体
   */
  entity: ClassConstructor<T>

  /**
   * # 表格高度
   */
  tableHeight?: number | string

  /**
   * # 表格宽度
   */
  tableWidth?: number | string

  /**
   * # 是否显示序号
   */
  showIndex?: boolean

  /**
   * # 要展示的字段列表（只会从本来要展示的字段列表中取值，不会新增字段）
   */
  fieldList?: string[]

  /**
   * # 字段排序参考
   */
  fieldOrder?: string[]

  /**
   * # 自定义列配置（可通过useTableHooks获取）
   */
  customColumns?: ICustomColumns[]
}

const props = defineProps<Props<AnyBaseModel>>()
const emits = defineEmits(['update:expandedRowKeys'])

// eslint-disable-next-line new-cap
const instance = new props.entity()

const expandedRowKeys = computed({
  get() {
    return props.expandedRowKeys
  },
  set(val) {
    emits('update:expandedRowKeys', val)
  },
})
/**
 * # 表格列配置
 */
const columns = computed(() => {
  if (props.columns) {
    return props.columns
  }
  else {
    const config = instance.getTableFieldConfigObj()
    let tableFieldList = instance.getTableFieldList()
    // 通过自定义列筛选配置的列对tableFieldList过滤
    if (props.customColumns?.length) {
      const alwaysColumns = tableFieldList.filter((item) => {
        return config[item].isAlways
      })
      const customColumnsFileds = props.customColumns?.map(i => i.dataIndex)
      tableFieldList = Array.from(new Set([...customColumnsFileds, ...alwaysColumns]))
    }

    // 过滤出要外部传入指定展示的字段
    if (props.fieldList?.length) {
      tableFieldList = tableFieldList.filter(item => props.fieldList?.includes(item))
    }

    // 按传入的顺序排序
    if (props.fieldOrder?.length) {
      tableFieldList = AnyDataTransformHelper.sortByArray(tableFieldList, props.fieldOrder)
    }

    const columns = tableFieldList.map((field) => {
      const configFieldList = instance.getTableFieldList()
      if (configFieldList.includes(field)) {
        const filedConfig = config[field] || {}
        const dictionaryArray = instance.getFieldDictionaryArray(field)
        // 1.配置有自定义渲染函数，则使用自定义渲染函数；
        // 2.检查字段是否有字典数组，有则使用字典数组；
        // 3.判断是否为日期类型，是则使用日期格式化函数；
        // 否则使用默认

        let customRender: any
        if (filedConfig.customRender) {
          customRender = filedConfig.customRender
        }
        else if (dictionaryArray) {
          customRender = ({ text }: { text: string }) => {
            return dictionaryArray.getLabelByKey(text)
          }
        }
        else if (filedConfig.dateFormat) {
          customRender = ({ text }: { text: string }) => {
            return AnyDateTimeHelper.format(text, filedConfig.dateFormat)
          }
        }
        return {
          title: instance.getTableFieldLabel(field),
          dataIndex: field,
          key: field,
          ellipsis: filedConfig?.ellipsis,
          width: filedConfig?.width,
          sorter: filedConfig?.sorter,
          fixed: filedConfig?.fixed,
          align: filedConfig?.align,
          ...(customRender ? { customRender } : {}),
        }
      }
      else {
        const item = props.customColumns?.find(i => i.dataIndex === field)
        return {
          title: item!.title,
          dataIndex: field,
          key: field,
          width: 100,
          ellipsis: true,
          customRender: ({ record, text }: any) => {
            const data = record.customizeValues?.find((i: ICustomProperties) => i.columnId === field)
            return data?.columnValue || text || ''
          },
        }
      }
    })
    // 是否展示表格index
    if (props.showIndex) {
      columns.unshift({
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        ellipsis: true,
        width: 60,
        sorter: false,
        fixed: undefined,
        align: 'center',
        customRender: ({ index }: { index: number }) => index + 1,
      })
    }

    return columns
  }
})
</script>
