import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 量能预警类型枚举
 */
export enum warningType {
  /** # 设备量能预警 */
  EQUIPMENT = 'EQUIPMENT',
  /** # 人员量能预警 */
  TEST_PERSON = 'TEST_PERSON',
}

/**
 * # 量能预警类型枚举
 */
export enum STATUS {
  /** # 待处理 */
  CREATED = 'CREATED',
  /** # 审核中 */
  AUDITING = 'AUDITING',
  /** # 已处理 */
  PROCESSED = 'PROCESSED',
  /** # 未通过 */
  AUDIT_REFUSED = 'AUDIT_REFUSED',
  /** # 已关闭 */
  CLOSED = 'CLOSED',
}
/**
 * # 量能预警处理方式枚举
 */
export enum CAPACITY_WARNING_DISPOSE_METHOD {

}
/**
 * # 量能预警类型字典
 */
export const warningTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: warningType.EQUIPMENT, label: '设备量能预警' },
  { key: warningType.TEST_PERSON, label: '人员量能预警' },
])

/**
 * # 流程处理状态字典
 */
export const statusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: STATUS.CREATED, label: '待处理' },
  { key: STATUS.AUDITING, label: '审核中' },
  { key: STATUS.PROCESSED, label: '已处理' },
  { key: STATUS.AUDIT_REFUSED, label: '未通过' },
  { key: STATUS.CLOSED, label: '已关闭' },
])

// 组合映射：key 为状态码，value 包含名称+颜色
export interface StatusConfig {
  label: string
  color: string
}

export const STATUS_CONFIG_MAP: Record<STATUS, StatusConfig> = {
  [STATUS.CREATED]: { label: '待处理', color: '#0066EC' },
  [STATUS.AUDITING]: { label: '审核中', color: '#F59A23' },
  [STATUS.PROCESSED]: { label: '已处理', color: '#4B7902' },
  [STATUS.AUDIT_REFUSED]: { label: '未通过', color: '#D9001B' },
  [STATUS.CLOSED]: { label: '已关闭', color: '#AAAAAA' },
}

export const WARNING_TYPE_MAP = {
  [warningType.EQUIPMENT]: '设备量能预警',
  [warningType.TEST_PERSON]: '人员量能预警',
}

export interface IBaseWarningInfo {
  reportSn?: string
  warningType?: warningType
  objectName?: string // 预警对象名称
  capacityLimit?: number
  warningDate?: string
  createDate?: string
  objectRemark?: string
}
export interface IWawningDetail {
  reportSn?: string
  objectName?: string
  objectRemark?: string
  useDateStart?: string | number
  useDateEnd?: string | number
}

export interface IDisposeData {
  method?: string
  description?: string
  attachments?: any[]
}
/**
 * # 量能预警
 */
export class CapacityEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
    placeholder: '预警类型',
  })
  @TableField({
    width: 90,
  })
  @SearchField()
  @CustomField('预警类型', warningTypeDict)
  warningType?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
    placeholder: '状态',
  })
  @TableField({
    width: 120,
  })
  @CustomField('状态')
  status?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
    placeholder: '状态',
  })
  @SearchField()
  @CustomField('状态', statusDict)
  warningStatus?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
    placeholder: '创建日期',
  })
  @TableField({
    width: 120,
  })
  @SearchField()
  @CustomField('创建日期')
  creatDate?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入报告编号、任务编号查询',
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQry?: string

  @TableField({
    width: 150,
  })
  @CustomField('报告编号')
  reportSn?: string

  @TableField({
    width: 120,
  })
  @CustomField('任务编号')
  taskSn?: string

  @TableField({
    width: 120,
  })
  @CustomField('预警对象')
  objectName?: string

  @TableField({
    width: 90,
  })
  @CustomField('量能阈值')
  capacityLimit?: string

  @TableField({
    width: 120,
  })
  @CustomField('预警日期')
  warningDate?: string

  @TableField({
    width: 120,
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: string
}

/**
 * # 量能预警日志
 */
export class WarningLogs extends AnyDataBaseEntity {
  @TableField({
    width: 120,
  })
  @CustomField('内容')
  content?: string

  @TableField({
    width: 120,
  })
  @CustomField('处理意见')
  handleOpinion?: string

  @TableField({
    width: 120,
  })
  @CustomField('对象编号')
  objectCode?: string

  @TableField({
    width: 80,
  })
  @CustomField('处理人')
  handlePerson?: string

  @TableField({
    width: 120,
  })
  @CustomField('时间')
  handleTime?: string
}
