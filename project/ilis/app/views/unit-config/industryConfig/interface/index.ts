import type { BUSINESS_SCOPE, FIELD_SOURCE, LAYOUT_FROM, OPTIONS_DATA_SOURCE, PROCESS_CONFIG } from '../enum'
import type { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
// import type { INDUSTRY_COMPONENT } from '~/views/consign/consignDetail'

// export { INDUSTRY_COMPONENT } from '~/views/consign/consignDetail'

/** 选项 */
export interface IOption {
  label: string
  value: string
}

/** 数据来源配置 */
export interface DataFromConfig {
  /** 静态数据 */
  statics: IOption[]
  /** 字典编码 */
  dict: string
  /** 接口地址 */
  url: {
    url: string
    label: string
    value: string
  }
  /** 组件 */
  component?: any
}

/** 领域字段配置 */
export interface IndustryConfig {
  id: string
  /** 业务模块 */
  scope: BUSINESS_SCOPE
  /** 字段来自哪个模块 */
  target: FIELD_SOURCE
  /** 自定义布局属于哪个模块 */
  layout?: LAYOUT_FROM
  /** 字段名称 */
  fieldName: string
  /** 字段标识 */
  fieldCode: string
  /** 显示名称 */
  fieldDisplayName: string
  /** 表单类型 */
  formType: EFormItemDynamicType
  /** 数据来源 */
  dataFrom?: OPTIONS_DATA_SOURCE
  /** 是否可设置默认值 */
  defaulted: boolean
  /** 是否必填：为true时，在布局中不允许取消必填 */
  required: boolean
  /** 数据来源配置 */
  config?: DataFromConfig
  /** 领域id */
  industryId?: string
  /** 字段库id */
  fieldLabId?: string
  /** 选中的 */
  selected: boolean
  /** 配置id：编辑时需将配置数据与字段库合并，单独定义字段保存配置数据的id，编辑时需要 */
  configId?: string
  /** 禁用必填：领域配置的必填，不允许修改（前端自定义，非接口属性） */
  disabledRequired?: boolean
  /** 是否前端新增字段 */
  isAdd?: boolean
  /** 排序 */
  sort?: number
}

/** 委托流程 */
export interface ProcessConfig {
  name: string
  module: PROCESS_CONFIG
  /** 是否必填：为true时，在布局中不允许取消必填 */
  required: boolean
}

/** 处理程序配置信息 */
export interface ProcessorConfigInfo {
  /** 字典名称 */
  name: string
  /** 作用域：config-配置页面，在领域配置页面直接根据 formType 进行渲染，business-业务页面，在具体的业务页面根据 formType 进行渲染 */
  scope: 'config' | 'business'
  /** 是否支持扩展 */
  scalable: boolean
  properties: Record<string, ProcessorConfigInfo_2>
}

/** 处理程序配置信息 */
export interface ProcessorConfigInfo_2 extends Omit<ProcessorConfigInfo, 'properties'> {
  /** 是否必填 */
  required: boolean
  /** 表单类型：select类型为前端添加，后台只保存 input、upload 类型 */
  formType: 'input' | 'upload' | 'select'
  /** 字典编码 */
  dictCode: string
  /** 是否为系统配置：前端添加属性，用于控制是否允许编辑 */
  isSystem?: boolean
  /** 属性：前端添加属性， */
  fieldCode?: string
}

export type ProcessorConfig = Record<string, ProcessorConfigInfo | ProcessorConfigInfo_2>

/** 处理程序 */
export interface ProcessorConfigs {
  program: string
  title: string
  config: ProcessorConfig
}
