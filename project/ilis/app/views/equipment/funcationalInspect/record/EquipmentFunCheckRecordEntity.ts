import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # entity
 */
export class EquipmentFunCheckRecordEntity extends AnyDataBaseEntity {
  @TableField({
    width: 150,
  })
  @CustomField('核查单号')
  checkCode?: string

  @TableField({
    width: 220,
  })
  @CustomField('核查来源')
  dataFrom?: string

  @TableField({
    width: 150,
  })
  @CustomField('设备名称')
  equipmentName?: string

  @TableField({
    width: 150,
  })
  @CustomField('设备编号')
  equipmentCode?: string

  @TableField({
    width: 150,
  })
  @CustomField('核查部门')
  checkDepartment?: number

  @TableField({
    width: 85,
  })
  @CustomField('核查人')
  checkUser?: number

  @TableField({
    width: 150,
    ellipsis: true,
  })
  @CustomField('核查项目')
  checkItems?: number

  @TableField({
    width: 150,
    sorter: true,
  })
  @CustomField('核查日期')
  checkDate?: number

  @TableField({
    width: 100,
  })
  @CustomField('状态')
  status?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 180,
  })
  @CustomField('操作')
  operation?: any
}
