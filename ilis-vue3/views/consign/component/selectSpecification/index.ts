import type { Specifications } from './api'

export { default as Specification } from './Specification.vue'
export { default as SpecificationModal } from './SpecificationModal.vue'
export { type SpecificationsInfo, type Specifications, VIEW_TYPE } from './api'

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

export const connectorValue = {
  ...DEFAULT_VALUE,
  displayName: '连接符',
  value: ' ',
}
