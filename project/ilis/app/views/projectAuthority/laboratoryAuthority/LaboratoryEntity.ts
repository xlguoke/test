import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

export class LaboratoryEntity extends AnyDataBaseEntity {
  @TableField({
    isAlways: true,
    align: 'center',
    width: '50%',
  })
  @CustomField('功能室名称')
  name?: string

  @TableField({
    isAlways: true,
    align: 'center',
    width: '50%',
  })
  @CustomField('备注')
  remark?: any
}
