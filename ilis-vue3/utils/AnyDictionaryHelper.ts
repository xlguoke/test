import type { IDictionary } from '~/interface/IDictionary'
import { AnyDictionaryArrayModel } from '~/model/DictionaryArrayModel'
import { AnyDictionaryModel } from '~/model/DictionaryModel'

/**
 * # 字典助手类
 */
export class AnyDictionaryHelper {
  /**
   * # 根据传入数据创建字典
   * @param data
   * @description 该方法会将传入的数据转换为字典对象
   * @example
   * ```ts
   * const dictionary = AnyDictionaryHelper.createDictionary(data);
   * ```
   */
  static #createDictionary(data: IDictionary) {
    const dictionary = new AnyDictionaryModel()
    const keys = Object.keys(dictionary)
    for (const key of keys) {
      // eslint-disable-next-line ts/ban-ts-comment, ts/prefer-ts-expect-error
      // @ts-ignore
      dictionary[key] = data[key]
    }
    return dictionary
  }

  /**
   * # 根据传入数据创建字典数组
   * @param data
   * @description 该方法会将传入的数据转换为字典数组
   * @example
   * ```ts
   * const dictionaryArray = AnyDictionaryHelper.createDictionaryArray(data);
   * ```
   */
  static createDictionaryArray(data: IDictionary[]): AnyDictionaryArrayModel<AnyDictionaryModel> {
    const dictionaryArray = new AnyDictionaryArrayModel<AnyDictionaryModel>()
    for (const item of data) {
      dictionaryArray.push(this.#createDictionary(item))
    }
    return dictionaryArray
  }
}
