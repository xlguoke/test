export { default as SnReocrd } from './list.vue'

/**
 * # 操作类型枚举
 */
export enum OperateType {
  USE = '10',
  RETURN = '20',
  PRESET = '30',
  PRESET_RETURN = '40',
}

/**
 * # 操作类型字典
 */
export const OperateTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: OperateType.USE, label: '使用' },
  { key: OperateType.RETURN, label: '退回' },
  { key: OperateType.PRESET, label: '预设' },
  { key: OperateType.PRESET_RETURN, label: '预设退回' },
])
