import type { RuleObject } from 'ant-design-vue/es/form'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'
import { AppConfig } from '~/anyThing/AppConfig'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { getCustomProperties } from '~/api/common'
import { FORM_TYPE } from '~/components/customAttribute'

interface ICustomPropertiesHooksConfig {
  /** # 自定义类型 */
  customizeType: string
  /** # 是否只读（设为只读且对应项无值时，不展示占位符） */
  readonly?: boolean
  /** # 初始化数据 */
  initData?: ICustomProperties[] | ICustomProperties[][]
  /**
   * # 是否是多表单类型
   * - 为true的情况下，传入的 ``initData``为``ICustomProperties[][]``，抛出的数据字段使用 ``customPropertiesArr``
   * - 用于表格当中使用自定义属性作为表单项的情况
   */
  isMultipleType?: boolean
}

/**
 * # 自定义属性hooks
 */
export function useCustomPropertiesHooks(config: ICustomPropertiesHooksConfig) {
  const customProperties = ref<ICustomProperties[]>([])
  const customPropertiesArr = ref<ICustomProperties[][]>([])
  function getRules(item: ICustomProperties) {
    return [
      ...(item.columnType === FORM_TYPE.INPUT ? [{ validator: AnyValidatorHelper.isLengthGreaterThan(AppConfig.MAX_LENGTH_INPUT), trigger: 'change' }] : []),
      ...(item.columnType === FORM_TYPE.SELECT_INPUT ? [{ validator: AnyValidatorHelper.isLengthGreaterThan(AppConfig.MAX_LENGTH_INPUT), trigger: 'change' }] : []),
      ...(item.columnType === FORM_TYPE.TEXT_AREA ? [{ validator: AnyValidatorHelper.isLengthGreaterThan(AppConfig.MAX_LENGTH_AREA), trigger: 'change' }] : []),
      ...(item.columnType === FORM_TYPE.INPUT_NUMBER ? [{ validator: AnyValidatorHelper.isGreaterThan(AppConfig.MAX_NUMBER), trigger: 'change' }] : []),
    ] as RuleObject[]
  }

  function getPlaceHolder(item: ICustomProperties) {
    if (config.readonly && !item.columnValue) {
      return ''
    }

    if ([FORM_TYPE.INPUT, FORM_TYPE.INPUT_NUMBER, FORM_TYPE.TEXT_AREA].includes(item.columnType)) {
      return `请输入${item.columnName}`
    }
    else {
      return `请选择${item.columnName}`
    }
  }

  // 原始配置数据
  const sourceData = ref<ICustomProperties[]>([])

  async function getCustomPropertieList(initData?: ICustomProperties[] | ICustomProperties[][]) {
    const { data } = await getCustomProperties(config.customizeType)
    sourceData.value = data
    if (config.isMultipleType) {
      customPropertiesArr.value = [];

      (initData as ICustomProperties[][])?.forEach((item) => {
        customPropertiesArr.value.push(_setDefaultValue(item))
      })
    }
    else {
      customProperties.value = _setDefaultValue(initData as ICustomProperties[])
    }

    function _setDefaultValue(initData: ICustomProperties[]) {
      let initDataMap: Record<string, any> = {}
      if (initData?.length) {
        initDataMap = initData.reduce((acc, cur) => {
          acc[cur.columnId] = cur.columnValue
          return acc
        }, {} as Record<string, any>)
      }

      const customPropertiesWithValue = sourceData.value?.map((item) => {
        // 设置option
        if (
          item.columnType === FORM_TYPE.SELECT
          || item.columnType === FORM_TYPE.RADIO
          || item.columnType === FORM_TYPE.SELECT_INPUT
          || item.columnType === FORM_TYPE.SELECT_MULTIPLE
        ) {
          item.options = item.columnValue
          item.columnValue = undefined
        }
        // 设置默认值
        if (initData?.length) {
          item.columnValue = initDataMap[item.id]
        }
        else {
          item.columnValue = item.defaultValue
        }
        // 下拉类型默认值
        if (item.columnType === FORM_TYPE.SELECT) {
          if (!item.columnValue) {
            item.columnValue = undefined
          }
        }
        // 下拉多选类型默认值
        if (item.columnType === FORM_TYPE.SELECT_MULTIPLE) {
          if (!item.columnValue) {
            item.columnValue = undefined
          }
          else {
            item.columnValue = item.columnValue.split(',')
          }
        }
        // 设置默认值
        return item
      })

      return customPropertiesWithValue
    }
  }

  getCustomPropertieList(config.initData)

  return {
    customProperties,
    customPropertiesArr,
    getRules,
    getPlaceHolder,
    getCustomPropertieList,
  }
}
