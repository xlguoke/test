import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * 标准物质台账表单实体
 * 用于 IlisForm 自动生成表单
 */
export class StandardMaterialLedgerFormEntity extends AnyDataBaseEntity {
  attachmentQrKey?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入标准物质名称',
    required: true,
  })
  @CustomField('标准物质名称')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入规格型号',
    required: true,
  })
  @CustomField('规格型号')
  specification?: string

  @FormField({ formType: EFormItemType.INPUT, required: true })
  @CustomField('生产厂家')
  manufacturer?: string

  @FormField({ formType: EFormItemType.DATE, required: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('生产日期')
  productionDate?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择保管人',
    required: true,
  })
  @CustomField('保管人')
  custodian?: string

  @FormField({ formType: EFormItemType.INPUT_NUMBER, required: true, min: 0 })
  @CustomField('库存余量')
  inventoryQuantity?: number

  @FormField({ formType: EFormItemType.INPUT_NUMBER, min: 1 })
  @CustomField('有效期(月)')
  validPeriodMonths?: number

  @FormField({
    required: true,
    formType: EFormItemType.INPUT,
    placeholder: '请选择计量单位',
  })
  @CustomField('计量单位')
  unit?: string

  @FormField({ formType: EFormItemType.INPUT_NUMBER, min: 0, attributes: {
    precision: 2,
  } })
  @CustomField('单价(元)')
  unitPrice?: number

  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('标准值')
  standardValue?: string

  @FormField({ formType: EFormItemType.INPUT_NUMBER, min: 0 })
  @CustomField('余量阈值')
  thresholdValue?: number

  // 最近购入时间，只有在详情时显示
  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('最近购入时间')
  lastPurchaseDate?: string

  // 最近购入数量
  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('最近购入数量')
  lastPurchaseQuantity?: number
}
