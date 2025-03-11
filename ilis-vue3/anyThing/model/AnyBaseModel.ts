import { getCustomFieldDictionaryArray, getCustomFieldName } from '../decorator/CustomField'
import { getFormFieldConfigObj, getFormFieldList } from '../decorator/FormField'
import { getSearchFileldConfigObj, getSearchFileldList } from '../decorator/SearchField'
import { getTableFieldConfigObj, getTableFieldList } from '../decorator/TableField'

/**
 * # 基础模型，包含一些通用操作
 */
export class AnyBaseModel {
  [key: string]: any
  /**
   * # 获取表单字段的label
   * 优先返回``@FormField``配置的label，其次返回``@CustomField``配置的值，否则返回字段key
   * @param field 当前字段key
   */
  getFormFieldLabel(field: string) {
    const formFiledConfig = this.getFormFieldConfigObj()[field]
    return formFiledConfig?.label || getCustomFieldName(this, field) || field
  }

  /**
   * # 获取表单字段的label
   * 优先返回``@FormField``配置的label，其次返回``@CustomField``配置的值，否则返回字段key
   * @param field 当前字段key
   * @returns 静态方法调用，返回实例方法调用
   */
  static getFormFieldLabel(field: string) {
    return new this().getFormFieldLabel(field)
  }

  /**
   * # 获取表格字段的label
   * 优先返回``@TableField``配置的label，其次返回``@CustomField``配置的值，否则返回字段key
   * @param field 当前字段key
   */
  getTableFieldLabel(field: string) {
    const tableFieldConfig = this.getTableFieldConfigObj()[field]
    return tableFieldConfig?.label || getCustomFieldName(this, field) || field
  }

  /**
   * # 获取表格字段的label
   * 优先返回``@TableField``配置的label，其次返回``@CustomField``配置的值，否则返回字段key
   * @param field 当前字段key
   * @returns 静态方法调用，返回实例方法调用
   */
  static getTableFieldLabel(field: string) {
    return new this().getTableFieldLabel(field)
  }

  /**
   * # 获取搜索字段的label
   * 优先返回``@SearchField``配置的label，其次返回``@CustomField``配置的值，否则返回字段key
   * @param field 当前字段key
   */
  getSearchFileldLabel(field: string) {
    const searchFieldConfig = this.getSearchFileldConfigObj()[field]
    return searchFieldConfig?.label || getCustomFieldName(this, field) || field
  }

  /**
   * # 获取搜索字段的label
   * 优先返回``@SearchField``配置的label，其次返回``@CustomField``配置的值，否则返回字段key
   * @param field 当前字段key
   * @returns 静态方法调用，返回实例方法调用
   */
  static getSearchFileldLabel(field: string) {
    return new this().getSearchFileldLabel(field)
  }

  /**
   * # 获取表格字段列表
   */
  getTableFieldList() {
    return getTableFieldList(this)
  }

  /**
   * # 获取表格字段列表
   * @returns 静态方法调用，返回实例方法调用
   */
  static getTableFieldList() {
    return new this().getTableFieldList()
  }

  /**
   * # 获取表格字段配置对象
   * 不传入字段列表，则获取所有标记了``@TableField``的属性的配置
   * @param fieldList 字段列表
   */
  getTableFieldConfigObj(...fieldList: string[]) {
    return getTableFieldConfigObj(this, fieldList)
  }

  /**
   * # 获取表格字段配置对象
   * @param fieldList 字段列表
   * @returns 静态方法调用，返回实例方法调用
   */
  static getTableFieldConfigObj(...fieldList: string[]) {
    return new this().getTableFieldConfigObj(...fieldList)
  }

  /**
   * # 获取搜索字段列表
   */
  getSearchFileldList() {
    return getSearchFileldList(this)
  }

  /**
   * # 获取搜索字段列表
   * @returns 静态方法调用，返回实例方法调用
   */
  static getSearchFileldList() {
    return new this().getSearchFileldList()
  }

  /**
   * # 获取搜索字段配置对象
   * 不传入字段列表，则获取所有标记了``@SearchField``的属性的配置
   * @param fieldList 字段列表
   */
  getSearchFileldConfigObj(...fieldList: string[]) {
    return getSearchFileldConfigObj(this, fieldList)
  }

  /**
   * # 获取搜索字段配置对象
   * @param fieldList 字段列表
   * @returns 静态方法调用，返回实例方法调用
   */
  static getSearchFileldConfigObj(...fieldList: string[]) {
    return new this().getSearchFileldConfigObj(...fieldList)
  }

  /**
   * # 获取表单字段列表
   */
  getFormFieldList() {
    return getFormFieldList(this)
  }

  /**
   * # 获取表单字段列表
   * @returns 静态方法调用，返回实例方法调用
   */
  static getFormFieldList() {
    return new this().getFormFieldList()
  }

  /**
   * # 获取表单字段配置对象
   * 不传入字段列表，则获取所有标记了``@FormField``的属性的配置
   * @param fieldList 字段列表
   */
  getFormFieldConfigObj(...fieldList: string[]) {
    return getFormFieldConfigObj(this, fieldList)
  }

  /**
   * # 获取表单字段配置对象
   * @param fieldList 字段列表
   * @returns 静态方法调用，返回实例方法调用
   */
  static getFormFieldConfigObj(...fieldList: string[]) {
    return new this().getFormFieldConfigObj(...fieldList)
  }

  /**
   * # 获取字段自定义字典数组
   * @param field 字段
   */
  getFieldDictionaryArray(field: string) {
    return getCustomFieldDictionaryArray(this, field)
  }

  /**
   * # 获取字段自定义字典数组
   * @param field 字段
   * @returns 静态方法调用，返回实例方法调用
   */
  static getFieldDictionaryArray(field: string) {
    return new this().getFieldDictionaryArray(field)
  }

  /**
   * # 获取字段opiton配置选项（适用antd select、radio、checkbox等）
   * @param field
   */
  getOptions(field: string) {
    return this.getFieldDictionaryArray(field)?.map((item) => {
      return {
        label: item.label,
        value: item.key,
      }
    })
  }

  /**
   * # 获取字段opiton配置选项（适用antd select、radio、checkbox等）
   * @param field
   * @returns 静态方法调用，返回实例方法调用
   */
  static getOptions(field: string) {
    return new this().getOptions(field)
  }

  /**
   * # 从json数据中解析出实体对象(实例调用)
   * @param json
   */
  fromJSON(json: Record<string, any>): this {
    return AnyBaseModel.parse(this, json)
  }

  /**
   * # 从json数据中解析出实体对象(静态调用)
   * @param this
   * @param json
   */
  static fromJSON<T extends AnyBaseModel>(this: new () => T, json: Record<string, any>): T {
    if (typeof json !== 'object') {
      throw new TypeError('fromJSON参数类型错误')
    }
    const instance = new this() as T
    return AnyBaseModel.parse(instance, json)
  }

  /**
   * # 从json数组中解析出实体对象数组(静态调用)
   * @param this
   * @param jsonArray
   */
  static fromJsonArray<T extends AnyBaseModel>(this: new () => T, jsonArray: Record<string, any>[] | Record<string, any>): T[] {
    if (!Array.isArray(jsonArray) && typeof jsonArray !== 'object') {
      throw new TypeError('fromJsonArray参数类型错误')
    }
    const instanceList: T[] = []

    const parseItem = (item: Record<string, any>): T => {
      const instance: T = new this()
      try {
        return AnyBaseModel.parse(instance, item)
      }
      catch (error) {
        console.error('Error parsing item:', error)
        return instance // 返回空实例，避免中断整个过程
      }
    }

    if (Array.isArray(jsonArray)) {
      jsonArray.forEach((item) => {
        instanceList.push(parseItem(item))
      })
    }
    else {
      instanceList.push(parseItem(jsonArray))
    }

    return instanceList
  }

  /**
   * # 解析JSON对象为实例对象
   * @param instance
   * @param json
   */
  private static parse<T extends AnyBaseModel>(instance: T, json: Record<string, any>) {
    const fieldList = Object.keys(instance)
    fieldList.forEach((field) => {
      const value = json[field]
      if (value !== undefined) {
        (instance as Record<string, any>)[field] = value
      }
    })
    return instance
  }
}
