import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'

/**
 * # 是否有培训计划枚举
 */
export enum HasTrainPlan {
  NO = '0',
  YES = '1',
}

/**
 * # 是否有培训计划字典
 */
export const HasTrainPlanDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '无', key: HasTrainPlan.NO },
  { label: '有', key: HasTrainPlan.YES },
])

/**
 * # 培训记录实体
 */
export class TrainRecordEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入培训主题/培训讲师',
    isOnlySearch: true,
  })
  @SearchField()
  quickQryParam?: string

  @FormField({
    formType: EFormItemType.RADIO,
  })
  @CustomField('培训计划', HasTrainPlanDict)
  isTrainPlan = HasTrainPlan.NO

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('培训主题')
  theme?: string

  @FormField({
    formType: EFormItemType.TEXTAREA,
  })
  @CustomField('培训内容')
  content?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('培训时间')
  trainTime?: number

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('培训地点')
  address?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('培训讲师')
  lecturer?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('培训对象')
  trainObject?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    min: 1,
  })
  @TableField()
  @CustomField('参与人数')
  peopleNum?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('培训类型')
  type?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('培训形式')
  trainForm?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    min: 0,
  })
  @TableField()
  @CustomField('培训时长')
  duration?: string

  @TableField()
  @CustomField('登记人')
  declare createName: string

  @TableField({
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('登记时间')
  declare createDate: Date

  @CustomField('自定义属性（提交）')
  customizeValueStr?: ICustomProperties[]

  @CustomField('自定义属性（列表返回）')
  customizeValues?: ICustomProperties[]

  @TableField({
    isAlways: true,
    width: 160,
  })
  @CustomField('操作')
  operation?: any
}
