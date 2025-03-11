import { AnyDecoratorHelper } from '../helper/AnyDecoratorHelper'
import type { ISearchFieldConfig } from '../interface/ISearchFieldConfig'

export const SEARCHFIELD_PROPERTY_KEY = 'SearchField'

/**
 * # 字段搜索配置装饰器
 * @param config 字段配置
 */
export function SearchField(config?: ISearchFieldConfig) {
  return function (target: any, key: string) {
    AnyDecoratorHelper.setFieldConfig(target, key, SEARCHFIELD_PROPERTY_KEY, config || {})
  }
}

/**
 * # 获取实例中配置了SearchField装饰器的字段列表
 * @param target
 */
export function getSearchFileldList(target: any) {
  return AnyDecoratorHelper.getFieldList(target, SEARCHFIELD_PROPERTY_KEY)
}

/**
 * # 获取实例中配置了SearchField装饰器的字段配置对象
 * @param target
 * @param fieldList 字段列表，不传时获取所有标记了``@SearchField``的属性的配置
 */
export function getSearchFileldConfigObj(target: any, fieldList: string[] = []) {
  return AnyDecoratorHelper.getFieldConfigList<ISearchFieldConfig>(target, SEARCHFIELD_PROPERTY_KEY, fieldList)
}
