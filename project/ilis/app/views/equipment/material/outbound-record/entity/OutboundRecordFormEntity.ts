import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { outTypeFormDict } from './OutboundRecordEntity'

/**
 * 出库记录表单实体
 * 用于 IlisForm 自动生成表单
 */
export class OutboundRecordFormEntity extends AnyDataBaseEntity {
  materialId?: string

  operatorId?: string

  attachmentQrKey?: string

  @FormField({
    formType: EFormItemType.SELECT,
    placeholder: '请选择标准物质',
    required: true,
  })
  @CustomField('标准物质名称')
  materialName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请选择规格型号',
    disabled: true,
  })
  @CustomField('规格型号')
  specification?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
    required: true,
  })
  @CustomField('计量单位')
  unit?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('出库类型', outTypeFormDict)
  outType?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
    min: 1,
    placeholder: '请输入出库数量',
  })
  @CustomField('出库数量')
  quantity?: number

  @FormField({
    formType: EFormItemType.TEXTAREA,
    max: 500,
    required: true,
  })
  @CustomField('用途')
  purpose?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
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
  @CustomField('出库人员')
  operator?: string

  @FormField({
    formType: EFormItemType.DATE,
    required: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('出库日期')
  outDate?: string
}
