import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export class TransportationProcessEntity extends AnyDataBaseEntity {
  @FormField()
  @CustomField('样品类型')
  a?: string

  @FormField()
  @CustomField('样品编号')
  b?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('样品数量')
  c?: string

  @FormField()
  @CustomField('运输过程保存方式')
  d?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('温度')
  e?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('湿度')
  f?: string
}
