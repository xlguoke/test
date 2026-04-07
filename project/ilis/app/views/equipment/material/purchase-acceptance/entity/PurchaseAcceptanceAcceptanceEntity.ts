import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * 验收登记明细实体类
 */
export class PurchaseAcceptanceAcceptanceEntity extends AnyDataBaseEntity {
  @CustomField('验收主表ID')
  acceptId?: string

  @CustomField('购置申请项ID')
  applyItemId?: string

  @CustomField('标准物质ID')
  materialId?: string

  @TableField({ width: 200 })
  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('标准物质名称')
  materialName?: string

  @TableField({ width: 150 })
  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('规格型号')
  materialSpecification?: string

  @TableField({ width: 120 })
  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 0,
    placeholder: '请输入实购数量',
  })
  @CustomField('实购数量')
  actualQuantity?: number

  @TableField({ width: 100 })
  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('单位')
  unit?: string

  @TableField({ width: 150 })
  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('验收情况')
  acceptResult?: string
}
