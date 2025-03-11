import { AnyDecoratorHelper } from '../helper/AnyDecoratorHelper'
import type { AnyDictionaryModel } from '../model/AnyDictionaryModel'
import type { AnyDictionaryArrayModel } from '../model/AnyDictionaryArrayModel'
import { getDictByCode } from '~/api/common'
import type { IDictByBackend } from '~/interface/IDictByBackend'

export const CUSTOMFIELD_PROPERTY_KEY = 'CustomField'

/**
 * # 字段自定义名称配置装饰器
 * @param name 字段名称
 * @param dictionaryArray 字典数组或者字典code(传入字典code自动调用字典接口)
 */
export function CustomField(name: string, dictionaryArray?: AnyDictionaryArrayModel<AnyDictionaryModel> | string, dictKey?: keyof IDictByBackend): any {
  return async function (target: any, key: string) {
    if (typeof dictionaryArray === 'string') {
      const { data } = await getDictByCode(dictionaryArray)
      dictionaryArray = AnyDictionaryHelper.createDictionaryArray(data.map((item) => {
        return {
          key: item[dictKey || 'typeCode'],
          label: item.typeName,
        }
      }))
    }
    AnyDecoratorHelper.setFieldConfig(target, key, CUSTOMFIELD_PROPERTY_KEY, {
      name,
      dictionaryArray,
    })
  }
}

/**
 * # 获取字段名称
 * @param target
 * @param field 字段
 */
export function getCustomFieldName(target: any, field: string) {
  return AnyDecoratorHelper.getFieldConfigList<{ name: string, dictionaryArray?: AnyDictionaryArrayModel<AnyDictionaryModel> }>(target, CUSTOMFIELD_PROPERTY_KEY, [field])?.[field]?.name
}

/**
 * # 获取字段配置字典数组
 * @param target
 * @param field
 */
export function getCustomFieldDictionaryArray(target: any, field: string) {
  return AnyDecoratorHelper.getFieldConfigList<{ name: string, dictionaryArray?: AnyDictionaryArrayModel<AnyDictionaryModel> }>(target, CUSTOMFIELD_PROPERTY_KEY, [field])?.[field]?.dictionaryArray
}
