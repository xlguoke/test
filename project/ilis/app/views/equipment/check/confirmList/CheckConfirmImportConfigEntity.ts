import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export class CheckConfirmImportConfigEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('序号')
  sort?: number

  @TableField()
  @CustomField('默认列名')
  modelName?: number

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('自定义列名')
  name?: number
}
