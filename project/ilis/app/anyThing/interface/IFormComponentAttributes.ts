import type { CheckboxGroupProps, DatePickerProps, InputNumberProps, InputProps, RadioGroupProps, SelectProps, SwitchProps, TextAreaProps, TreeSelectProps } from 'ant-design-vue'
import type InputColorPicker from '../components/input/InputColorPicker.vue'
import type { EFormItemType } from '../enum/EFormItemType'

/**
 * # 表单组件属性映射接口 ⚙️
 * - 根据formType映射到对应的组件属性类型
 */
export interface IFormComponentAttributes {
  [EFormItemType.INPUT]: InputProps
  [EFormItemType.INPUT_RANGE]: InputProps & { range?: boolean }
  [EFormItemType.INPUT_NUMBER]: InputNumberProps
  [EFormItemType.INPUT_SELECTOR]: InputProps & { selector?: boolean }
  [EFormItemType.SELECT]: SelectProps
  [EFormItemType.DATE]: DatePickerProps
  [EFormItemType.DATETIME]: DatePickerProps & { showTime?: boolean }
  [EFormItemType.DATE_RANGE]: DatePickerProps & { range?: boolean }
  [EFormItemType.DATETIME_RANGE]: DatePickerProps & { showTime?: boolean, range?: boolean }
  [EFormItemType.RADIO]: RadioGroupProps
  [EFormItemType.CHECKBOX]: CheckboxGroupProps
  [EFormItemType.TEXTAREA]: TextAreaProps
  [EFormItemType.SWITCH]: SwitchProps
  [EFormItemType.TREE_SELECT]: TreeSelectProps
  [EFormItemType.COLOR_PICKER]: InstanceType<typeof InputColorPicker>
}

/**
 * # 基于formType的attributes类型 ⚙️
 * @template T - 表单类型枚举值
 */
export type FormAttributes<T extends EFormItemType> = IFormComponentAttributes[T]
