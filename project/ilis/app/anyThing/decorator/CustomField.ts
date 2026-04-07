import type { AnyDictionaryArrayModel } from '../model/AnyDictionaryArrayModel'
import type { AnyDictionaryModel } from '../model/AnyDictionaryModel'
import type { IDictByBackend } from '~/interface/IDictByBackend'
import type { IDictionary } from '~/interface/IDictionary'
import { getDictByCode } from '~/api/common'
import { AnyDecoratorHelper } from '../helper/AnyDecoratorHelper'

export const CUSTOMFIELD_PROPERTY_KEY = 'CustomField'

/**
 * # 字段自定义名称配置装饰器
 * @param name 字段名称
 * @param dictionaryArray 字典数组或者字典code(传入字典code自动调用字典接口)
 */
export function CustomField(name: string, dictionaryArray?: AnyDictionaryArrayModel<AnyDictionaryModel> | string | (() => Promise<IDictionary[]>), dictKey?: keyof IDictByBackend): any {
  return async function (target: any, key: string) {
    // 临时方案，解决异步获取数据阻断配置挂载，导致渲染时获取不到 name 问题
    AnyDecoratorHelper.setFieldConfig(target, key, CUSTOMFIELD_PROPERTY_KEY, {
      name,
    })
    if (typeof dictionaryArray === 'string') {
      const { data } = await getDictByCode(dictionaryArray)
      dictionaryArray = AnyDictionaryHelper.createDictionaryArray(data.map((item) => {
        return {
          key: item[dictKey || 'typeCode'],
          label: item.typeName,
        }
      }))
    }
    else if (typeof dictionaryArray === 'function') {
      const options = await dictionaryArray()
      if (!options || !options.length) {
        console.error('字典数据错误!')
        dictionaryArray = AnyDictionaryHelper.createDictionaryArray([])
      }
      else {
        dictionaryArray = AnyDictionaryHelper.createDictionaryArray(options)
      }
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
