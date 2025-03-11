import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { TableField } from '~/anyThing/decorator/TableField'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import type { STANDARD_TYPE } from '~/types/standard'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as WaitCheckNewStandard } from './Index.vue'
export { STANDARD_TYPE, SOURCE_TYPE, STANDARD_TYPE_DICT } from '~/types/standard'
export class WaitCheckNewEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入规程名称或颁布号查询',
  })
  @SearchField()
  @CustomField('模糊查询')
  q?: string

  @TableField()
  @CustomField('规程名称')
  standardName?: string

  @TableField()
  @CustomField('颁布号')
  publishCode?: string

  @TableField()
  @CustomField('规程类型')
  type?: STANDARD_TYPE

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('执行日期')
  executeDate?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('过期日期')
  expireDate?: string

  @TableField()
  @CustomField('是否系统规程')
  sourceType?: boolean
}

/** 数据来源 */
export enum DATA_FROM {
  /** 数据中心 */
  D_CENTER = 'hitekCenter',
  /** 本地规程库 */
  LOCAL = 'local',
}
