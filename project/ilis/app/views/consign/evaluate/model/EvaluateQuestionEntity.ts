import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 评价问题类型枚举
 */
export enum QuestionType {
  /** # 单选 */
  RADIO = 'RADIO',
  /** # 多选 */
  SELECT = 'SELECT',
  /** # 文本 */
  TEXT = 'TEXT',
}

/**
 * # 评价问题类型字典
 */
export const QuestionTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: QuestionType.RADIO, label: '单选' },
  { key: QuestionType.SELECT, label: '多选' },
  { key: QuestionType.TEXT, label: '文本' },
])

/**
 * # 是否预警项枚举
 */
export enum IsCautionItem {
  NO = 'NO',
  YES = 'YES',
}

/**
 * # 问题选项接口
 */
export interface QuestionOption {
  id: string
  /** # 问题选项名称 */
  name: string
  /** # 问题选项是否为预警项 */
  caution: IsCautionItem
}

/**
 * # 评价问题实体
 */
export class EvaluateQuestionEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('问题标题')
  title!: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('答案类型', QuestionTypeDict)
  type = QuestionType.RADIO

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @CustomField('问题提示')
  tips?: string

  @CustomField('排序号')
  sort!: number

  @CustomField('是否删除')
  deleted!: string

  /** # 问题选项（提交用） */
  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '多个候选值以半角逗号分隔',
  })
  @CustomField('问题选项')
  itemsStr?: string[]

  /** # 警示选项（提交用） */
  @FormField({
    formType: EFormItemType.SELECT,
  })
  @CustomField('警示选项')
  cautionItems?: string[]

  @CustomField('问题选项（后端返回）')
  items?: QuestionOption[]

  /** # 评价结果（无效字段，只是为了radio组件使用v-model） */
  result?: any
}
