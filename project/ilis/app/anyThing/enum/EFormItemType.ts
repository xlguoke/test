/**
 * # 表单类型
 */
export enum EFormItemType {
  INPUT = 'input',
  INPUT_RANGE = 'inputRange',
  INPUT_NUMBER = 'inputNumber',
  INPUT_SELECTOR = 'inputSelector',
  SELECT = 'select',
  DATE = 'date',
  DATETIME = 'datetime',
  DATE_RANGE = 'dateRange',
  DATETIME_RANGE = 'datetimeRange',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  SWITCH = 'switch',
  TREE_SELECT = 'treeSelect',
  COLOR_PICKER = 'colorPicker',
}

/**
 * # 表单类型 - 动态表单配置
 */
export enum EFormItemDynamicType {
  INPUT = 'input',
  INPUT_RANGE = 'inputRange',
  INPUT_NUMBER = 'inputNumber',
  INPUT_SELECTOR = 'inputSelector',
  SELECT = 'select',
  /** 下拉列表（可输可选） */
  SELECT_INPUT = 'selectUpdate',
  /** 下拉列表（多选） */
  SELECT_MULTIPLE = 'selectMultiple',
  DATE = 'date',
  DATE_RANGE = 'dateRange',
  TIME = 'time',
  TIME_RANGE = 'timeRange',
  DATETIME = 'datetime',
  DATETIME_RANGE = 'datetimeRange',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  SWITCH = 'switch',
  TREE_SELECT = 'treeSelect',
  /** 上传文件 */
  UPLOAD = 'upload',
}
