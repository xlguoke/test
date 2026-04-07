import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * 购置验收明细表单实体
 */
export class PurchaseAcceptanceDetailFormEntity extends AnyDataBaseEntity {
  @CustomField('验收主表ID')
  acceptId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择标准物质名称',
    required: true,
  })
  @CustomField('标准物质名称')
  materialName?: string

  materialId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择规格型号',
    required: true,
  })
  @CustomField('规格型号')
  materialSpecification?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择生产厂家',
    required: true,
  })
  @CustomField('生产厂家')
  manufacturer?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
    placeholder: '请选择生产日期',
  })
  @CustomField('生产日期')
  productionDate?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 1,
    max: 9999,
    placeholder: '请输入购置数量',
  })
  @CustomField('购置数量')
  quantity?: number

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 0,
    max: 9999,
    placeholder: '请输入单价',
  })
  @CustomField('单价(元)')
  unitPrice?: number

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入或选择单位',
  })
  @CustomField('单位')
  unit?: string

  amount?: number

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入或选择保管人',
  })
  @CustomField('保管人')
  custodian?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
    placeholder: '请选择购置日期',
  })
  @CustomField('购置日期')
  purchaseDate?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入备注',
  })
  @CustomField('备注')
  remark?: string

  applyItemId?: string

  isCustomMaterial?: boolean

  isCustomSpecification?: boolean

  _specificationOptions?: { value: string, id: string }[]

  _originalSpecificationOptions?: { value: string, id: string }[]
}
