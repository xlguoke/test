import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 报告更正状态枚举
 */
export enum ReportCorrectionStatus {
  /** # 填写中 */
  WAIT_APPROVE = '填写中',
  /** # 审核中 */
  APPROVE_ING = '审核中',
  /** # 未通过 */
  APPROVE_REJECT = '未通过',
  /** # 已通过 */
  APPROVE_SUCCESS = '已通过',
}

/**
 * ## 申请类型枚举
 *
 */
export enum APPLICATION_TYPE {
  /**
   * ## 视频核查
   */
  VIDEO_VERIFY = 'VIDEO_VERIFY',
  /**
   * ## 纸质报告
   */
  PAPER_REPORT = 'PAPER_REPORT',
  /**
   * ## 报告更正
   */
  REPORT_AMEND = 'REPORT_AMEND',
}
/**
 * ## 申请类型字典
 * {@link APPLICATION_TYPE}
 */
export const APPLICATION_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: APPLICATION_TYPE.VIDEO_VERIFY,
    label: '视频核查',
  },
  {
    key: APPLICATION_TYPE.PAPER_REPORT,
    label: '纸质报告',
  },
  {
    key: APPLICATION_TYPE.REPORT_AMEND,
    label: '报告更正',
  },
])
/**
 * ## 处理说明{通过，不通过}
 */
export enum AUDIT_PASS {
  /**
   * ## 未通过
   */
  NOT_APPROVED = 'NOT_APPROVED',
  /**
   * ## 已完成
   */
  COMPLETED = 'COMPLETED',
}
/**
 * ## 处理说明字典{通过，不通过}
 * {@link AUDIT_STATUS}
 */
export const AUDIT_PASS_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: false,
    label: '不通过',
    color: '#D9001B',
  },
  {
    key: true,
    label: '通过',
    color: '#4B7902',
  },
])

/**
 * # 报告领取方式
 */
export enum GET_REPORT_TYPE {
  /** 自取 */
  SELF = '1',
  /** 邮寄 */
  MAIL = '3',
}
/**
 * # 报告领取方式字典
 */
export const GET_REPORT_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: GET_REPORT_TYPE.SELF,
    label: '自取',
  },
  {
    key: GET_REPORT_TYPE.MAIL,
    label: '邮寄',
  },
])

/**
 * # 待审核报告
 */
export class WaitAuditReportEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @SearchField({ width: '180px' })
  @CustomField('申请类型', APPLICATION_TYPE_DICT)
  applicationType?: APPLICATION_TYPE

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('委托单位')
  consignUnit?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('委托编号')
  consignCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('报告编号')
  reportCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('创建人')
  applicant?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    width: 120,
    sorter: true,
  })
  @CustomField('创建时间')
  applicationDate?: Date

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({ width: '240px' })
  @CustomField('创建时间')
  applicationDateSearch?: Date[]

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '委托单位/委托编号/报告编号',
  })
  @SearchField({ width: '240px' })
  @CustomField('快捷查询')
  q?: string

  @TableField({
    width: 120,
    isAlways: true,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}

/**
 * # 已审核报告
 */
export class ReportAuditEntity extends WaitAuditReportEntity {
  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    width: 120,
    sorter: true,
  })
  @CustomField('审核日期')
  auditDate?: Date

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({ width: '240px' })
  @CustomField('审核日期')
  auditDateSearch?: Date[]

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @SearchField({ width: '180px' })
  @CustomField('审核结果', AUDIT_PASS_DICT)
  auditPass?: boolean

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('审核人')
  auditor?: string

  @TableField({
    width: 120,
    isAlways: true,
    fixed: 'right',
  })
  @CustomField('操作')
  declare operation?: any
}
