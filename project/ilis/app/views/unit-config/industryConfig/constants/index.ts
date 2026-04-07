import { INDUSTRY_COMPONENT } from '~/enum/EDynamicForm'
import { FIELD_SOURCE, OPTIONS_DATA_SOURCE } from '../enum'

export const FIELD_SOURCE_MAP = {
  [FIELD_SOURCE.CONSIGN]: '委托',
  [FIELD_SOURCE.SAMPLE]: '样品',
  [FIELD_SOURCE.TASK]: '任务',
  [FIELD_SOURCE.REPORT]: '报告',
}

export const FIELD_SOURCE_DICT = AnyDictionaryHelper.createDictionaryArray([
  { label: '委托', key: FIELD_SOURCE.CONSIGN },
  { label: '样品', key: FIELD_SOURCE.SAMPLE },
  { label: '任务', key: FIELD_SOURCE.TASK },
  { label: '报告', key: FIELD_SOURCE.REPORT },
])

/** 数据源 */
export const OPTIONS_DATA_SOURCE_DICT = AnyDictionaryHelper.createDictionaryArray([
  { label: 'API获取', key: OPTIONS_DATA_SOURCE.API },
  { label: '数据字典', key: OPTIONS_DATA_SOURCE.DICT },
  { label: '静态数据', key: OPTIONS_DATA_SOURCE.STATIC },
  { label: '组件', key: OPTIONS_DATA_SOURCE.COMPONENT },
  { label: '--', key: OPTIONS_DATA_SOURCE.NONE },
])

/** ## 组件-字段映射 */
export const INPUT_COMPONENT = [
  { label: '资质类型', value: INDUSTRY_COMPONENT.QualificationType, filed: ['qualificationTypeId'] },
  { label: '委托单位/工程项目', value: INDUSTRY_COMPONENT.ConsignUnitAndProject, filed: ['consignUnit', 'project', 'sampleSender', 'sampleSenderPhone'] },
  { label: '委托编号', value: INDUSTRY_COMPONENT.ConsignCode, filed: ['consignCode'] },
  { label: '单位工程', value: INDUSTRY_COMPONENT.UnitProject, filed: ['unitProject'] },
  { label: '邮寄信息', value: INDUSTRY_COMPONENT.MailingInfo, filed: ['postFormId'] },
  { label: '缴费单位', value: INDUSTRY_COMPONENT.PaymentUnit, filed: ['paymentUnitName'] },
]
