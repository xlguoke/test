import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export class SetPositionCodeBatchEntity extends AnyDataBaseEntity {
  @FormField({ formType: EFormItemType.SELECT, required: true })
  @CustomField('目的地编号', 'lab::position')
  positionCode?: string
}
