import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 设备授权entity
 */
export class EquipmentFunCheckPlanEntity extends AnyDataBaseEntity {
  @TableField({
    width: 150,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('制定日期')
  createDate?: string

  @TableField({
    isAlways: true,
    width: 180,
  })
  @CustomField('操作')
  operation?: any
}
