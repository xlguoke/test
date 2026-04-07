import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export class SampleRetentionEntity extends AnyDataBaseEntity {
  @FormField()
  @CustomField('样品类型')
  a?: string

  @FormField()
  @CustomField('样品编号')
  b?: string

  @FormField()
  @CustomField('测试项目')
  c?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('样品数量')
  d?: string

  @FormField()
  @CustomField('交样室摆放位置')
  e?: string

  @FormField()
  @CustomField('交样室保存方式')
  f?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('温度')
  g?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('湿度')
  h?: string
}
