import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * 采购申请明细表格实体
 * 用于表格数据回显
 */
export class PurchaseApplyDetailEntity extends AnyDataBaseEntity {
  // 是否验收
  isAccepted?: boolean

  // 标准物质id
  materialId?: string

  @TableField({ width: 150 })
  @CustomField('标准物质名称')
  materialName?: string

  @TableField({ width: 150 })
  @CustomField('规格型号')
  materialSpecification?: string

  @TableField({ width: 150 })
  @CustomField('数量')
  quantity?: number

  @TableField({ width: 150 })
  @CustomField('单价(元)')
  unitPrice?: number

  @TableField({ width: 150 })
  @CustomField('单位')
  unit?: string

  @TableField({ width: 150 })
  @CustomField('小计 (元)')
  amount?: number

  @TableField({ width: 150 })
  @CustomField('保管人')
  custodian?: string

  @TableField({ width: 150 })
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 100,
  })
  @CustomField('操作')
  operation?: any
}
