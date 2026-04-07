import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** # 报告发放方式枚举 */
export enum ReportIssueWay {
  /** # 自取 */
  SELF = '1',
  /** # 代领 */
  DELEGATE = '2',
  /** # 邮寄 */
  POST = '3',
  /** # 传真 */
  FAX = '4',
}

/** # 报告发放方式枚举翻译字典 */
export const ReportIssueWayDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '自取', key: ReportIssueWay.SELF },
  { label: '代领', key: ReportIssueWay.DELEGATE },
  { label: '邮寄', key: ReportIssueWay.POST },
  { label: '传真', key: ReportIssueWay.FAX },
])

/** # 报告签字方式枚举 */
export enum SignType {
  /** # 短信 */
  MESSAGE = 'MESSAGE',
  /** # 二维码 */
  QR_CODE = 'QR_CODE',
}

/** # 报告签字方式枚举翻译字典 */
export const SignTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '短信', key: SignType.MESSAGE },
  { label: '二维码', key: SignType.QR_CODE },
])

/** # 签字人员身份枚举 */
export enum SignUserType {
  /** # 委托人(和委托的委托人字段保持一致，即送样人) */
  SAMPLE_SENDER = 'SAMPLE_SENDER',
  /** # 相同单位委托人(和委托的委托人字段保持一致，即送样人) */
  SAME_UNIT_SAMPLE_SENDER = 'SAME_UNIT_SAMPLE_SENDER',
}

/** # 签字人员身份枚举字典翻译 */
export const SignUserTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '当前报告委托人', key: SignUserType.SAMPLE_SENDER },
  { label: '相同单位委托人', key: SignUserType.SAME_UNIT_SAMPLE_SENDER },
])

/**
 * 报告发放中实体类
 */
export class BeingIssueEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入经办人/领取人/报告编号',
  })
  @SearchField()
  @CustomField('快捷查询')
  q?: string

  @TableField()
  @CustomField('发放方式', ReportIssueWayDict)
  issueWay?: ReportIssueWay

  @TableField()
  @CustomField('经办人')
  operatorName?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('发放日期')
  issueDate?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('发放日期')
  issueDateSearch?: string

  @TableField()
  @CustomField('领取人')
  receiver?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField()
  @CustomField('签字方式', SignTypeDict)
  signType?: SignType

  @TableField()
  @CustomField('签字人员身份', SignUserTypeDict)
  signUserType?: SignUserType

  @TableField()
  @CustomField('签字人员姓名')
  signUserName?: string

  @TableField()
  @CustomField('签字人员电话')
  signUserPhone?: string

  @TableField()
  @CustomField('签字')
  x?: string // 目前没有这个字段，但产品要求占位

  @TableField()
  @CustomField('报告编号')
  reportNumber?: string

  @TableField({
    width: 120,
    fixed: 'right',
  })
  @CustomField('操作')
  Action?: string
}
