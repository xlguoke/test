import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * 购置验收明细表格实体
 * 用于表格数据回显
 */
export class PurchaseAcceptanceDetailEntity extends AnyDataBaseEntity {
  @CustomField('验收主表ID')
  acceptId?: string

  @CustomField('购置申请项ID')
  applyItemId?: string

  @CustomField('标准物质ID')
  materialId?: string

  @TableField({ width: 200 })
  @CustomField('标准物质名称')
  materialName?: string

  @TableField({ width: 200 })
  @CustomField('规格型号')
  materialSpecification?: string

  @TableField({ width: 150 })
  @CustomField('生产厂家')
  manufacturer?: string

  @TableField({ width: 150 })
  @CustomField('生产日期')
  productionDate?: string

  @TableField({ width: 150 })
  @CustomField('购置数量')
  quantity?: number

  @CustomField('实购数量')
  actualQuantity?: number

  @TableField({ width: 150 })
  @CustomField('单价(元)')
  unitPrice?: number

  @TableField({ width: 150 })
  @CustomField('单位')
  unit?: string

  @TableField({ width: 150 })
  @CustomField('小计(元)')
  amount?: number

  @TableField({ width: 150 })
  @CustomField('保管人')
  custodian?: string

  @TableField({ width: 150 })
  @CustomField('购置日期')
  purchaseDate?: string

  @CustomField('验收情况')
  acceptResult?: string

  @TableField({ width: 150, ellipsis: true })
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 80,
  })
  @CustomField('操作')
  operation?: any
}
