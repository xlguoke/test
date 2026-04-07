import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 设备核查时间entity
 */
export class EquipmentInspectTimeEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @TableField()
  @CustomField('时间')
  time?: Date

  @TableField({
    isAlways: true,
    width: 60,
  })
  @CustomField('操作')
  operation?: any
}
