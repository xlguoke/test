import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'

export class RollBackEntity extends AnyBaseModel {
  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('退回节点')
  target?: string

  @FormField({
    formType: EFormItemType.TEXTAREA,
    required: true,
  })
  @CustomField('退回原因')
  reason?: string
}
