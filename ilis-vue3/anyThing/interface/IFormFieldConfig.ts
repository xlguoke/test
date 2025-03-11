import type { EFormItemType } from '../enum/EFormItemType'
import type { IFieldBaseConfig } from './IFieldBaseConfig'
import type { IInputSelectorConfig } from './IInputSelectorConfig'

/**
 * # 表单字段配置接口
 */
export interface IFormFieldConfig extends IFieldBaseConfig {
  /**
   * # 表单类型
   * @see {@link EFormItemType}
   */
  formType: EFormItemType

  /**
   * # 是否仅用于搜索字段
   */
  isOnlySearch?: boolean

  /**
   * # 校验触发方式
   */
  trigger?: 'change' | 'blur'

  /**
   * # 允许的最小值
   * 适用{@link EFormItemType.INPUT_NUMBER}
   */
  min?: number

  /**
   * # 允许的最大值
   * 适用{@link EFormItemType.INPUT_NUMBER}
   */
  max?: number

  /**
   * # 允许的最大长度
   * 适用{@link EFormItemType.INPUT}
   */
  maxLength?: number

  /**
   * # 允许的最小长度
   * 适用{@link EFormItemType.INPUT}
   */
  minLength?: number

  /**
   * # 是否必填
   */
  required?: boolean

  /**
   * # 占位符
   */
  placeholder?: string

  /**
   * # 日期格式(传入后会在提交时自动转换)
   */
  dateFormat?: EDateFormatType

  /**
   * # 是否去除两端空格（还没开发相关应用，传了无效）
   */
  trim?: boolean

  /**
   * # 默认值（还没开发相关应用，传了无效）
   */
  defaultValue?: any

  /**
   * # 选中值
   * 适用{@link EFormItemType.SWITCH}
   */
  checkedValue?: any

  /**
   * # 未选中值
   * 适用{@link EFormItemType.SWITCH}
   */
  unCheckedValue?: any

  /**
   * # 是否禁用（仅对表单组件生效）
   */
  disabled?: boolean

  /**
   * # 选择器输入框的配置
   * 适用{@link EFormItemType.INPUT_SELECTOR}
   */
  selectorConfig?: IInputSelectorConfig
}
