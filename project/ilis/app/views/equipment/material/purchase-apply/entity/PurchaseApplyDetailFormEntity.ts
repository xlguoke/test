import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export interface SpecificationOption {
  value: string
  id: string
}

export class PurchaseApplyDetailFormEntity extends AnyDataBaseEntity {
  materialId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择标准物质名称',
    required: true,
  })
  @CustomField('标准物质名称')
  materialName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择规格型号',
    required: true,
  })
  @CustomField('规格型号')
  materialSpecification?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 1,
    max: 9999,
    placeholder: '请输入数量',
  })
  @CustomField('数量')
  quantity?: number

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    min: 0,
    max: 9999,
    placeholder: '请输入单价',
  })
  @CustomField('单价(元)')
  unitPrice?: number

  @FormField({
    required: true,
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择单位',
  })
  @CustomField('单位')
  unit?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择保管人',
  })
  @CustomField('保管人')
  custodian?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '备注',
  })
  @CustomField('备注')
  remark?: string

  amount?: number

  isCustomMaterial?: boolean

  isCustomSpecification?: boolean

  _specificationOptions?: SpecificationOption[]
  _originalSpecificationOptions?: SpecificationOption[]
}
