<template>
  <a-table
    :row-key="rowKey"
    :loading="loading"
    :data-source="dataSource"
    :pagination="pagination"
    :row-selection="rowSelection"
    :columns="columns"
    @change="onChange"
  >
    <template #bodyCell="{ column, record, text }">
      <slot
        name="bodyCell"
        :record="record"
        :column="column"
        :text="text"
      ></slot>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import type { TableProps } from 'ant-design-vue'
import type { ClassConstructor } from '../types/ClassConstructor'
import type { AnyBaseModel } from '../model/AnyBaseModel'

interface Props<T> extends TableProps {
  /**
   * # 配置实体
   */
  entity: ClassConstructor<T>
}

const props = defineProps<Props<AnyBaseModel>>()

/**
 * # 表格列配置
 */
const columns = computed(() => {
  if (props.columns) {
    return props.columns
  }
  else {
    const instance = new props.entity!()
    const tableFieldList = instance.getTableFieldList()
    const config = instance.getTableFieldConfigObj(...tableFieldList)
    return tableFieldList.map((field) => {
      const filedConfig = config[field]
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
    })
  }
})
</script>
