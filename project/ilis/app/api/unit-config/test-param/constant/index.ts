import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'
import { EDataType } from '../enum'

/**
 * ## 数据类型字典
 * @description 用于表单下拉选择和表格显示
 */
export const DataTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EDataType.TEXT, label: '文本' },
  { key: EDataType.NUMBER, label: '数值' },
  { key: EDataType.DATE, label: '日期' },
  { key: EDataType.LIST, label: '下拉列表' },
])
