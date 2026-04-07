import type { Specifications } from './api'

export { type Specifications, type SpecificationsInfo, VIEW_TYPE } from './api'
export { default as Specification } from './Specification.vue'
export { default as SpecificationModal } from './SpecificationModal.vue'

/**
 * # 自定义规格型号
 */
export const DEFAULT_VALUE: Specifications = {
  displayName: '自定义',
  name: '',
  value: '-',
  attributeId: '',
  deleteAble: true,
  orderNo: 9999,
  inputHistory: [],
  systemFieldName: '',
  customized: true,
}

/**
 * # 默认连接符 - 空格
 */
export const connectorValue = {
  ...DEFAULT_VALUE,
  displayName: '连接符',
  value: ' ',
}

export const connector_default = ' ;_;-;/;(;)'

export type StandardField = 'model' | 'specification' | 'grade' | 'label'

/**
 * # 旧规则，表示规格型号的系统字段 systemFieldName
 */
export const SYSTEM_FIELDS_NAME = ['型号', '规格', '等级', '标号']

/**
 * # 规格型号系统字段对应的属性
 */
export const SYSTEM_FIELDS_ENUM: { [key: string]: StandardField } = {
  型号: 'model',
  规格: 'specification',
  等级: 'grade',
  标号: 'label',
}
