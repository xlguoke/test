import type { IndustryConfig, IOption } from '~/views/unit-config/industryConfig'

/** 委托布局类别 */
export enum LAYOUT_FORM_TYPE {
  /** 原材料委托 */
  CONSIGN = 'MATERIAL',
  /** 综合试验 */
  SYNTHESIS_CONSIGN = 'COMPREHENSIVE',
}

/** 旧版委托布局类型映射 */
export const OLD_LAYOUT_MAP = {
  /** 委托表单 */
  [LAYOUT_FORM_TYPE.CONSIGN]: 'consign',
  /** 综合试验表单 */
  [LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN]: 'synthesisConsign',
}

/** 树形待选项 */
export interface ConfigOption extends IOption {
  key: any
  category?: boolean
}

export interface ConfigTreeOption extends ConfigOption {
  children?: ConfigTreeOption[]
}

/** 布局字段配置 */
export interface LayoutConfig {
  /** 横向坐标 */
  x: number
  /** 纵向坐标 */
  y: number
  /** 宽 - 所占栅格数 */
  w: number
  /** 高 - 不支持修改，默认为1em，基于row-height的值设置 */
  h: number
  /** 唯一标识：对应字段属性 */
  i: string
  /** 是否必填 */
  required: boolean
  /** 是否显示 */
  isShow: boolean
  /** 默认值 */
  value?: any
}

/** 自定义字段 */
export interface IndustryCustomField extends IndustryConfig {
  /** 默认值 */
  defaultValue?: string | number | boolean | string[] | null
  /** 是否盲样 */
  isBlind?: boolean
  /** 待选项 */
  options?: ConfigOption[] | ConfigTreeOption[]
  /** 禁用项：如控制参数控制不显示的 */
  disabled?: boolean
  /** 禁用原因 */
  disabledMsg?: string
}

/** 领域字段布局配置 */
export interface IndustryLayoutConfig extends IndustryCustomField, LayoutConfig {}

/** 旧版布局配置 */
export interface OldLayoutConfig {
  key: string
  /** 配置项 */
  layout: {
    label: string
    w: number
    x: number
    y: number
    h: number
    tdAttributes: string
    required: boolean
    isHidden: boolean
  }[][]
  /** 隐藏字段 */
  hideField: string[]
}
