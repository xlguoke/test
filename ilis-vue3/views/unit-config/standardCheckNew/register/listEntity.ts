import type { CHECKNEW_RECORD_STATUS } from './components/checkNewResult'
import { CHECKNEW_RECORD_STATUS_DICT } from './components/checkNewResult'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { STANDARD_TYPE_DICT } from '~/types/standard'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as StandardCheckNewRegister } from './List.vue'

/** 自定义属性类型 */
export const CUSTOM_ATTRIBUTE_TYPE = 'standard-check-new'

/** 自定义列类型 */
export const CUSTOM_COLUMN_TYPE = 'standard-check-new'

/**
 * ## 查新登记
 */
export class StandardCheckNewRegisterEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('规程名称')
  standardName?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('颁布号')
  standardPublishCode?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @TableField()
  @CustomField('规程类型', STANDARD_TYPE_DICT)
  standardType?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @TableField()
  @CustomField('查新结果', CHECKNEW_RECORD_STATUS_DICT)
  status?: CHECKNEW_RECORD_STATUS

  @TableField()
  @CustomField('新规程')
  newStandard?: string

  @FormField({
    label: '规程名称(新)',
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入规程名称',
  })
  @CustomField('规程名称(新)')
  newStandardName?: string

  @FormField({
    label: '颁布号(新)',
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入颁布号',
  })
  newStandardPublishCode?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
    placeholder: '请选择发布日期',
  })
  @CustomField('发布日期(新)')
  newStandardPublishDate?: Date

  @FormField({
    label: '执行日期(新)',
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField()
  @CustomField('执行日期')
  newStandardExecuteDate?: Date

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('执行日期')
  searchExecuteDate?: [Date, Date]

  @TableField()
  @CustomField('查新人')
  checkUser?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    sorter: true,
  })
  @CustomField('查新日期')
  checkDate?: Date

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('查新日期')
  searchCheckDate?: [Date, Date]

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入规程名称或颁布号',
    isOnlySearch: true,
  })
  @SearchField()
  q?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  action?: string
}
