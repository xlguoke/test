import { CustomField } from '~/anyThing/decorator/CustomField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 购置申请实体
 */
export class PurChaseRecordEntity extends AnyDataBaseEntity {
  @SearchField()
  quickQryParam?: string

  @TableField({
    width: 120,
  })
  @CustomField('申请单号')
  requestCode?: string

  @TableField({
    width: 120,
  })
  @CustomField('申请原因')
  requestReason?: string

  @TableField({
    width: 120,
  })
  @CustomField('申请部门')
  requestDepartment?: string

  @TableField({
    width: 120,
  })
  @CustomField('申请人')
  applicant?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    width: 120,
  })
  @CustomField('申请时间')
  requestTime?: Date

  @TableField({
    width: 120,
    ellipsis: true,
  })
  @CustomField('备注')
  description?: string

  @TableField({
    width: 120,
  })
  @CustomField('状态')
  status?: string

  @TableField({
    isAlways: true,
    width: 160,
  })
  @CustomField('操作')
  Action?: any
}
