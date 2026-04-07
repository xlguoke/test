import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * 返还入库表单实体
 * 用于 IlisForm 自动生成表单
 */
export class ReturnFormEntity extends AnyDataBaseEntity {
  // 出库记录ID，必须
  stockOutId?: string

  // 附件二维码Key（隐藏字段，用于提交）
  attachmentQrKey?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('标准物质名称')
  materialName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('规格型号')
  specification?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('计量单位')
  unit?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('入库类型')
  inType?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 1,
    placeholder: '请输入返还数量',
  })
  @CustomField('返还数量')
  quantity?: number

  /** 已出库数量 */
  @CustomField('出库数量')
  outQuantity?: number

  /** 已返还数量 */
  @CustomField('已返还数量')
  returnQuantity?: number

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
    placeholder: '请选择返还人员',
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
  @CustomField('返还人员')
  operator?: string

  // 返还人员ID
  operatorId?: string

  @FormField({
    formType: EFormItemType.DATE,
    required: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('返还日期')
  returnDate?: string

  @CustomField('总数量')
  totalQuantity?: number

  @CustomField('已返还数量')
  returnedQuantity?: number
}
