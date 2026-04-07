import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { ISystemParam } from '~/api/system/system-param/types'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType.ts'

/**
 * 日期类型格式化
 * @param item 表单项配置
 * @param timeAccuracy 系统控制参数: 时间精度
 */
export function initDateFormat(item: IndustryLayoutConfig, timeAccuracy: ISystemParam['TIME_ACCURACY']) {
  const { DATE, DATETIME, DATE_RANGE, DATETIME_RANGE, TIME, TIME_RANGE } = EFormItemDynamicType

  if ([DATETIME, DATETIME_RANGE].includes(item.formType)) {
    if (timeAccuracy === 'accuracy_year')
      return EDateFormatType.YYYY
    if (timeAccuracy === 'accuracy_month')
      return EDateFormatType.YYYY_MM
    if (timeAccuracy === 'accuracy_day')
      return EDateFormatType.YYYY_MM_DD
    if (timeAccuracy === 'accuracy_hour')
      return EDateFormatType.YYYY_MM_DD_HH
    if (timeAccuracy === 'accuracy_minute')
      return EDateFormatType.YYYY_MM_DD_HH_MM
    return EDateFormatType.YYYY_MM_DD_HH_MM_SS
  }
  else if ([DATE, DATE_RANGE].includes(item.formType)) {
    if (timeAccuracy === 'accuracy_year')
      return EDateFormatType.YYYY
    if (timeAccuracy === 'accuracy_month')
      return EDateFormatType.YYYY_MM
    return EDateFormatType.YYYY_MM_DD
  }
  else if ([TIME, TIME_RANGE].includes(item.formType)) {
    return EDateFormatType.HH_MM_SS
  }
}

/** 处理占位符 */
export function initPlaceholder(item: IndustryLayoutConfig) {
  const { SELECT, INPUT_SELECTOR, DATE, DATETIME, RADIO, CHECKBOX, TREE_SELECT, DATE_RANGE, DATETIME_RANGE, TIME_RANGE } = EFormItemDynamicType
  if ([SELECT, INPUT_SELECTOR, DATE, DATETIME, RADIO, CHECKBOX, TREE_SELECT].includes(item.formType)) {
    return `请选择${item.fieldName}`
  }
  else if ([DATE_RANGE, DATETIME_RANGE, TIME_RANGE].includes(item.formType)) {
    return [`${item.fieldName}开始`, `${item.fieldName}结束`]
  }
  return `请输入${item.fieldName}`
}

/** 校验提示信息 */
export function initRuleMessage(item: IndustryLayoutConfig) {
  const { SELECT, INPUT_SELECTOR, DATE, DATETIME, RADIO, CHECKBOX, TREE_SELECT, DATE_RANGE, DATETIME_RANGE, TIME_RANGE } = EFormItemDynamicType
  if ([SELECT, INPUT_SELECTOR, DATE, DATETIME, RADIO, CHECKBOX, TREE_SELECT, DATE_RANGE, DATETIME_RANGE, TIME_RANGE].includes(item.formType)) {
    return `请选择${item.fieldName}`
  }
  return `请输入${item.fieldName}`
}
