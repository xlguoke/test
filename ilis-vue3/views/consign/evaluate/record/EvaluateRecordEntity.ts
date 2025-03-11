import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 评价来源枚举
 * 短信、链接、报告
 */
export enum EvaluationSourceType {
  /** # 短信 */
  SMS = 'SMS',
  /** # 链接 */
  LINK = 'LINK',
  /** # 报告 */
  REPORT = 'REPORT',
}

/**
 * # 评价来源字典
 */
export const EvaluationSourceTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EvaluationSourceType.SMS, label: '短信' },
  { key: EvaluationSourceType.LINK, label: '链接' },
  { key: EvaluationSourceType.REPORT, label: '报告' },
])

/**
 * # 警示状态枚举
 * 无警示、待处理、已处理
 */
export enum CautionStatus {
  /** # 无警示 */
  NO = 'NOTHINGS',
  /** # 待处理 */
  WAIT = 'OPEN',
  /** # 已处理 */
  FINISH = 'CLOSE',
}

/**
 * # 警示状态字典
 */
export const CautionStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CautionStatus.NO, label: '无警示', color: '#d7d7d7' },
  { key: CautionStatus.WAIT, label: '待处理', color: '#d9001b' },
  { key: CautionStatus.FINISH, label: '已处理', color: '#4b7902' },
])

/**
 * # 评价记录entity
 */
export class EvaluateRecordEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('问卷名称')
  name!: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @CustomField('问卷名称')
  modelId!: string

  @TableField()
  @CustomField('委托单位')
  consignUnitName!: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @CustomField('委托单位')
  consignUnitId!: string

  @TableField()
  @CustomField('姓名')
  sampleSenderName!: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField()
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('评价日期')
  declare createDate: Date

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @TableField()
  @CustomField('评价来源', EvaluationSourceTypeDict)
  type?: EvaluationSourceType

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @TableField()
  @CustomField('警示状态', CautionStatusDict)
  status?: CautionStatus

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入评价人姓名查询',
  })
  @SearchField()
  @CustomField('快速查询')
  quickQry?: string

  @FormField({
    formType: EFormItemType.TEXTAREA,
    required: true,
    maxLength: 100,
  })
  @CustomField('处理警示')
  dealWidth?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
