import type { StandardMaterialLedgerEntity } from '../../standard-material-ledger/entity/StandardMaterialLedgerEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { InboundTypeFormDict } from './InboundRecordEntity'

/**
 * 入库记录表单实体
 * 用于 IlisForm 自动生成表单
 */
export class InboundRecordFormEntity extends AnyDataBaseEntity {
  materialId?: string

  attachmentQrKey?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择标准物质名称',
    required: true,
  })
  @CustomField('标准物质名称')
  materialName?: string

  @FormField({
    placeholder: '请输入或选择规格型号',
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('规格型号')
  materialSpecification?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('生产厂家')
  manufacturer?: string

  @FormField({
    formType: EFormItemType.DATE,
    required: true,
    placeholder: '',
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('生产日期')
  productionDate?: string

  @FormField({
    required: true,
    formType: EFormItemType.INPUT,
    placeholder: '请选择计量单位',
  })
  @CustomField('计量单位')
  unit?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入或选择保管人',
    required: true,
  })
  @CustomField('保管人')
  custodian?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('入库类型', InboundTypeFormDict)
  inType?: string

  @FormField({
    formType: EFormItemType.DATE,
    required: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('购置日期')
  purchaseDate?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 1,
    placeholder: '请输入入库数量',
  })
  @CustomField('入库数量')
  quantity?: number

  @FormField({
    required: true,
    placeholder: '请选择入库人员',
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      multiple: false,
      allowInput: false,
      onSelect: (val: IUserSelectVoEntity[], formData) => {
        formData.operatorId = val?.map(i => i.id)?.join(',')
        formData.operator = val?.map(i => i.name)?.join(',')
      },
    },
  })
  @CustomField('入库人员')
  operator?: string

  operatorId?: string

  @FormField({
    formType: EFormItemType.DATE,
    required: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('入库日期')
  stockInDate?: string

  unitCode?: string

  acceptItemId?: string

  sysCompanyCode?: string

  @CustomField('是否自定义物质')
  isCustomMaterial?: boolean

  @CustomField('是否自定义规格')
  isCustomSpecification?: boolean

  material?: StandardMaterialLedgerEntity
}
