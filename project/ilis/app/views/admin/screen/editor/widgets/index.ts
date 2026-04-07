/**
 * # 组件类型枚举
 */
export enum WidgetCategory {
  /** # 通用组件 */
  COMMON = 'COMMON',
  /** # 功能室组件 */
  FUNCTIONAL_ROOM = 'FUNCTIONAL_ROOM',
  /** # 自定义组件 */
  CUSTOM = 'CUSTOM',
}

/**
 * # 组件类型字典
 */
export const WidgetCategoryDict = AnyDictionaryHelper.createDictionaryArray([
  { key: WidgetCategory.COMMON, label: '通用组件' },
  { key: WidgetCategory.FUNCTIONAL_ROOM, label: '功能室特定组件' },
  { key: WidgetCategory.CUSTOM, label: '自定义组件' },
])

/**
 * # 已有组件板块枚举
 * 调整后注意更新授权设备屏相应枚举与模块渲染逻辑
 */
export enum WidgetList {
  /** # 任务模块组件 */
  Task = 'Task',
  /** # 温湿度模块组件 */
  HumitureInfo = 'HumitureInfo',
  /** # 送样模块组件 */
  SampleInfo = 'SampleInfo',
  /** # 设备模块组件 */
  DeviceInfo = 'DeviceInfo',
  /** # 功能室简介 */
  LabIntro = 'LabIntro',
  /** # 设备外出申请管理 */
  EqOutApply = 'EqOutApply',
  /** # 标养室 */
  StandardRoom = 'StandardRoom',
  /** # 外检室 */
  ExternalCheckRoom = 'ExternalCheckRoom',
  /** # 标准物质间 */
  StandardSubstanceRoom = 'StandardSubstanceRoom',
  /** # 样品室 */
  SampleRoom = 'SampleRoom',
  /** # 留样室 */
  SampleStorageRoom = 'SampleStorageRoom',
  /** # 药品室 */
  MedicineRoom = 'MedicineRoom',
}
