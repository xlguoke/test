import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'

export interface IAttributes {
  customizeValues: ICustomProperties[]
}

/**
 * # 培训计划状态枚举
 */
export enum TrainPlanStatus {
  /** # 填写中 */
  WRITING = '10',
  /** # 审批中 */
  APPROVING = '20',
  /** # 审批未通过 */
  APPROVE_FAIL = '30',
  /** # 已审批 */
  APPROVED = '40',
}

/**
 * # 培训计划状态字典
 */
export const TrainPlanStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: TrainPlanStatus.WRITING, label: '填写中' },
  { key: TrainPlanStatus.APPROVING, label: '审批中' },
  { key: TrainPlanStatus.APPROVE_FAIL, label: '审批未通过' },
  { key: TrainPlanStatus.APPROVED, label: '已审批' },
])

/**
 * # 培训计划实体
 */
export class TrainPlanEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入培训主题/培训讲师',
    isOnlySearch: true,
  })
  @SearchField()
  quickQryParam?: string

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
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
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
  @CustomField('创建人')
  declare createName: string

  @TableField({
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('创建时间')
  declare createDate: Date

  @SearchField()
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @TableField()
  @CustomField('计划状态', TrainPlanStatusDict)
  status?: Date

  @CustomField('自定义属性（提交）')
  customizeValueStr?: ICustomProperties[]

  @CustomField('自定义属性（列表返回）')
  customizeValues?: ICustomProperties[]

  @CustomField('自定义属性（详情返回）')
  attributes?: IAttributes

  @TableField({
    width: 200,
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
