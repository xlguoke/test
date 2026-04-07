import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export const CUSTOMMIZE_TYPE = 'report_amend_application'

/**
 * ## 申请来源
 */
export enum APPLICATION_FROM {
  /**
   * ## 系统内创建
   */
  LOCAL = 'local',
  /**
   * ## 预委托平台
   */
  PRE = 'pre',
}

/**
 * 申请来源字典
 */
export const APPLICATION_FROM_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: APPLICATION_FROM.LOCAL,
    label: '系统内创建',
  },
  {
    key: APPLICATION_FROM.PRE,
    label: '预委托平台',
  },
])

/**
 * ## 审核状态
 */
export enum AUDIT_STATUS {
  /**
   * ## 填写中
   */
  IN_FILLING = 'IN_FILLING',
  /**
   * ## 审核中
   */
  UNDER_REVIEW = 'UNDER_REVIEW',
  /**
   * ## 未通过
   */
  NOT_APPROVED = 'NOT_APPROVED',
  /**
   * ## 已通过
   */
  COMPLETED = 'COMPLETED',
}

/**
 * ## 审核状态字典
 * {@link AUDIT_STATUS}
 */
export const AUDIT_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: AUDIT_STATUS.IN_FILLING,
    label: '填写中',
    color: '#0066ec',
  },
  {
    key: AUDIT_STATUS.UNDER_REVIEW,
    label: '审核中',
    color: '#F59A23',
  },
  {
    key: AUDIT_STATUS.NOT_APPROVED,
    label: '未通过',
    color: '#D9001B',
  },
  {
    key: AUDIT_STATUS.COMPLETED,
    label: '已通过',
    color: '#4B7902',
  },
])

export class ReportAmendEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '委托单位、委托编号、报告编号',
  })
  @SearchField()
  @CustomField('模糊查询')
  q?: string

  @TableField({
    width: 120,
  })
  @CustomField('委托单位')
  consignUnit?: string

  @TableField({
    width: 120,
  })
  @CustomField('委托编号')
  consignCode?: string

  @TableField({
    width: 120,
  })
  @CustomField('报告编号')
  reportCode?: string

  @TableField({
    width: 120,
  })
  @CustomField('申请人')
  applicant?: string

  @TableField({
    width: 120,
    sorter: true,
  })
  @CustomField('申请日期')
  applicationDate?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('申请日期')
  applicationDateRange?: Date

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @SearchField()
  @TableField({
    width: 120,
  })
  @CustomField('数据来源', APPLICATION_FROM_DICT)
  applicationFrom?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @SearchField()
  @TableField({
    width: 120,
  })
  @CustomField('状态', AUDIT_STATUS_DICT)
  status?: string

  @TableField({
    width: 160,
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}

export class WaitAmendReportEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('委托单位')
  consignUnit?: string

  @TableField()
  @CustomField('委托编号')
  consignCode?: string

  @TableField()
  @CustomField('报告编号')
  reportCode?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField()
  @TableField()
  @CustomField('发放日期')
  issueDate?: string

  @TableField()
  @CustomField('发放份数')
  issueQty?: number

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '委托单位、委托编号、报告编号',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('模糊查询')
  q?: string
}
