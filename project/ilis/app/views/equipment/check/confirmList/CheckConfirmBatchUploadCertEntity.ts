import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export class CheckConfirmBatchUploadCertEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('上传文件名称')
  name?: string

  @FormField({
    formType: EFormItemType.CHECKBOX,
  })
  @TableField()
  @CustomField('匹配设备')
  eqCheckList?: string

  @TableField()
  @CustomField('上传结果')
  result?: string

  @TableField()
  @CustomField('操作')
  operation?: string
}
