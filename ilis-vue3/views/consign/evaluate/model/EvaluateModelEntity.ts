import type { EvaluateQuestionEntity } from './EvaluateQuestionEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 问卷状态枚举
 */
export enum EvaluateModelStatus {
  /** # 线上 */
  OPEN = 'OPEN',
  /** # 线下 */
  CLOSE = 'CLOSE',
}

/**
 * # 问卷设置entity
 */
export class EvaluateModelEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('创建人')
  declare createBy: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('问卷名称')
  quickQry?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('问卷名称')
  name!: string

  @TableField()
  @CustomField('创建人')
  declare createName: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('创建日期')
  declare createDate: Date

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('最近更新日期')
  declare updateDate: Date

  @TableField()
  @CustomField('应用到线上')
  status?: EvaluateModelStatus

  @TableField({
    sorter: true,
  })
  @CustomField('问题数')
  problemNum?: number

  @TableField({
    sorter: true,
  })
  @CustomField('已评价份数')
  recordNum?: number

  @CustomField('问卷问题列表')
  problemList: EvaluateQuestionEntity[] = []

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
