import type { IFormFieldConfig } from '../interface/IFormFieldConfig'
import { EFormItemType } from '../enum/EFormItemType'
import { AnyDecoratorHelper } from '../helper/AnyDecoratorHelper'

export const FORMFIELD_PROPERTY_KEY = 'FormField'

/**
 * # 字段表单配置装饰器
 * 表单类型默认为input类型
 * @param config 字段配置
 */
export function FormField<T extends EFormItemType = EFormItemType.INPUT>(config?: IFormFieldConfig<T>) {
  if (!config) {
    config = { formType: EFormItemType.INPUT } as IFormFieldConfig<T>
  }
  if (config && !config.formType) {
    config.formType = EFormItemType.INPUT as T
  }
  if (config.selectorConfig) {
    config.selectorConfig = markRaw(config.selectorConfig)
  }
  return function (target: any, key: string) {
    AnyDecoratorHelper.setFieldConfig(target, key, FORMFIELD_PROPERTY_KEY, config)
  }
}

/**
 * # 获取实例中配置了FormField装饰器的字段列表
 * @param target
 */
export function getFormFieldList(target: any) {
  const formFieldList = AnyDecoratorHelper.getFieldList(target, FORMFIELD_PROPERTY_KEY)
  const config = getFormFieldConfigObj(target, formFieldList)
  // 过滤配置中isOnlySearch为true的字段
  const keys = Object.keys(config).filter(i => !config[i].isOnlySearch)
  return keys
}

/**
 * # 获取实例中配置了FormField装饰器的字段配置对象
 * @param target
 * @param fieldList 字段列表，不传时获取所有标记了``@FormField``的属性的配置
 */
export function getFormFieldConfigObj(target: any, fieldList: string[] = []) {
  return AnyDecoratorHelper.getFieldConfigList<IFormFieldConfig>(target, FORMFIELD_PROPERTY_KEY, fieldList)
}
