import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as CustomAttribute } from './Index.vue'

/**
 * ## 自定义属性表单类型
 */
export enum FORM_TYPE {
  /** 文本框 */
  INPUT = 'input',
  /** 数字文本框 */
  INPUT_NUMBER = 'inputNumber',
  /** 文本域 */
  TEXT_AREA = 'textarea',
  /** 下拉列表 */
  SELECT = 'select',
  /** 下拉列表（可输可选） */
  SELECT_INPUT = 'selectUpdate',
  /** 单选框 */
  RADIO = 'radio',
  /** 日期组件 */
  DATE = 'date',
}

/**
 * ## 表单类型字典
 */
export const FORM_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: FORM_TYPE.INPUT,
    label: '文本框',
  },
  {
    key: FORM_TYPE.INPUT_NUMBER,
    label: '数字文本框',
  },
  {
    key: FORM_TYPE.TEXT_AREA,
    label: '文本域',
  },
  {
    key: FORM_TYPE.SELECT,
    label: '下拉列表',
  },
  {
    key: FORM_TYPE.SELECT_INPUT,
    label: '下拉列表（可输可选）',
  },
  {
    key: FORM_TYPE.RADIO,
    label: '单选框',
  },
  {
    key: FORM_TYPE.DATE,
    label: '日期组件',
  },
])

export class CustomAttributeEntity extends AnyDataBaseEntity {
  @SearchField()
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入属性名称回车即可查询',
  })
  @CustomField('属性名称')
  queryName?: string

  @TableField()
  @CustomField('属性名称')
  declare columnName: string

  @TableField()
  @CustomField('属性类型')
  columnType?: FORM_TYPE

  @TableField()
  @CustomField('候选值')
  columnValue?: string

  @TableField({
    width: 60,
  })
  @CustomField('排序号')
  columnIndex?: number

  @TableField()
  @CustomField('创建人')
  declare createName: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    width: 140,
  })
  @CustomField('创建时间')
  declare createDate: Date
}
