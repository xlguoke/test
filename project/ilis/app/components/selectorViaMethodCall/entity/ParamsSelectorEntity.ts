import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { EquipmentCheckParamEntity } from '~/views/equipment/check/param/EquipmentCheckParamEntity'

export class ParamsSelectorEntity extends EquipmentCheckParamEntity {
  @TableField({ width: 120 })
  @CustomField('设备编号')
  equipmentSn?: string

  @TableField({ width: 120 })
  @CustomField('设备名称')
  equipmentName?: string

  @TableField({ width: 120 })
  @CustomField('所属科室')
  departName?: string
}
