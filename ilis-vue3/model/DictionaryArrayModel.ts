import type { IDictionary } from '~/interface/IDictionary'

/**
 * # 字典数组模型
 * @description 该模型用于存储字典数组
 */
export class AnyDictionaryArrayModel<T extends IDictionary> extends Array<T> {
  /**
   * # 根据传入字典的键获取label
   * @param key
   * @description 该方法会根据传入的键获取对应的label
   * @example
   * ```ts
   * const label = dictionaryArray.getLabelByKey(key);
   * ```
   */
  getLabelByKey(key: string | number | symbol | boolean | undefined) {
    const dictionary = this.find(item => item.key === key)
    return dictionary?.label
  }

  /**
   * # 根据传入字典的键获取description
   * @param key
   * @description 该方法会根据传入的键获取对应的description
   * @example
   * ```ts
   * const description = dictionaryArray.getDescriptionByKey(key);
   * ```
   */
  getDescriptionByKey(key: string | number | symbol | boolean) {
    const dictionary = this.find(item => item.key === key)
    return dictionary?.description
  }

  /**
   * # 根据传入字典的键获取获取color
   * @param key
   */
  getColorByKey(key: string | number | symbol | boolean) {
    const dictionary = this.find(item => item.key === key)
    return dictionary?.color
  }

  /**
   * # 根据传入字典的键数组获取字典数组
   */
  expose(keyArr: (string | number | symbol | boolean)[]) {
    return this.filter(item => keyArr.includes(item.key)) as AnyDictionaryArrayModel<T>
  }

  /**
   * # 根据传入字典的键数组获取排除后的字典数组
   */
  exclude(keyArr: (string | number | symbol | boolean)[]) {
    return this.filter(item => !keyArr.includes(item.key)) as AnyDictionaryArrayModel<T>
  }
}
