import { STANDARD_TYPE_DICT } from '~/types/standard'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as CheckNewResult } from './Index.vue'

/** 查新结果状态 */
export enum CHECKNEW_RECORD_STATUS {
  /** 待查新 */
  PENDING = 'PENDING',
  /** 更新规程 */
  UPDATED = 'UPDATED',
  /** 暂无更新 */
  NOT_REQUIRED = 'NOT_REQUIRED',
  /** 已废止 */
  DEPRECATED = 'DEPRECATED',
}

/** 查新结果状态字典 */
export const CHECKNEW_RECORD_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  { label: '待查新', key: CHECKNEW_RECORD_STATUS.PENDING },
  { label: '更新规程', key: CHECKNEW_RECORD_STATUS.UPDATED },
  { label: '暂无更新', key: CHECKNEW_RECORD_STATUS.NOT_REQUIRED },
  { label: '已废止', key: CHECKNEW_RECORD_STATUS.DEPRECATED },
])

export class CheckNewResultEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('规程名称')
  standardName?: string

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
  status?: string

  @TableField()
  @CustomField('新规程')
  newStandardName?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
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

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
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

  @CustomField('是否重复')
  repeated?: boolean

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入规程名称或颁布号',
  })
  @SearchField()
  @CustomField('模糊查询')
  q?: string
}
