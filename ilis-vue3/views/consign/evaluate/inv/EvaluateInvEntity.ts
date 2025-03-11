import type { EvaluateInvUserEntity } from './EvaluateInvUserEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 邀请方式枚举
 */
export enum EvaluateInvType {
  /** # 链接 */
  LINK = 'LINK',
  /** # 短信 */
  SMS = 'SMS',
}

/**
 * # 邀请方式字典
 */
export const EvaluateInvTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EvaluateInvType.LINK, label: '链接' },
  { key: EvaluateInvType.SMS, label: '短信' },
])

/**
 * # 邀请状态枚举
 */
export enum EvaluateInvStatus {
  /** # 已结束 */
  CLOSE = 'CLOSE',
  /** # 进行中 */
  OPEN = 'OPEN',
}

/**
 * # 邀请状态字典
 */
export const EvaluateInvStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EvaluateInvStatus.CLOSE, label: '已结束' },
  { key: EvaluateInvStatus.OPEN, label: '进行中' },
])

/**
 * # 评价邀请entity
 */
export class EvaluateInvEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('邀请人')
  declare createBy: string

  @TableField()
  @CustomField('问卷名称')
  name!: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('问卷名称')
  modelId!: string

  @TableField()
  @CustomField('邀请人')
  declare createName: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('邀请日期')
  declare createDate: Date

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('问卷名称')
  quickQry?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @TableField()
  @CustomField('邀请方式', EvaluateInvTypeDict)
  type?: EvaluateInvType

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @TableField({
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('结束日期')
  dueTime?: string

  @TableField()
  @CustomField('邀请人数')
  userNum?: number

  @TableField()
  @CustomField('已评人数')
  recordNum?: number

  @TableField()
  @CustomField('邀请状态', EvaluateInvStatusDict)
  status?: EvaluateInvStatus

  @CustomField('邀请人员（提交用）')
  userList: EvaluateInvUserEntity[] = []

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
