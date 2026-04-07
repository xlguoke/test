import type { EFormItemType } from '../enum/EFormItemType'
import type { IFormFieldConfig } from '../interface/IFormFieldConfig'

/**
 * # 表单类型工具类 ⚙️
 * - 提供表单配置相关的类型工具函数
 */

/**
 * # 根据表单类型创建字段配置 ⚙️
 * @template T - 表单类型枚举值
 */
export type CreateFormFieldConfig<T extends EFormItemType> = IFormFieldConfig<T>

/**
 * # 表单字段配置映射 ⚙️
 * - 用于快速创建特定类型的表单配置
 */
export type FormFieldConfigMap = {
  [K in EFormItemType]: IFormFieldConfig<K>
}

/**
 * # 获取表单配置类型 ⚙️
 * @param type - 表单类型
 * @returns 对应的表单配置类型
 */
export function getFormConfigType<T extends EFormItemType>(_type: T): IFormFieldConfig<T> {
  return {} as IFormFieldConfig<T>
}

/**
 * # 表单配置工厂函数 ⚙️
 * - 创建类型安全的表单配置对象
 */
export function createFormFieldConfig<T extends EFormItemType>(
  type: T,
  config: Omit<IFormFieldConfig<T>, 'formType'>,
): IFormFieldConfig<T> {
  return {
    formType: type,
    ...config,
  } as IFormFieldConfig<T>
}
