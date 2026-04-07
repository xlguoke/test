import type dayjs from 'dayjs'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

export class TraceabilityEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('溯源机构')
  traceabilityOrgName?: string

  @TableField()
  @CustomField('证书编号')
  certificateSn?: string

  @TableField()
  @CustomField('证书有效期至')
  validityDate?: string | dayjs.Dayjs

  @CustomField('设备ID')
  equipmentId?: string

  @TableField()
  @CustomField('操作')
  operation?: any
}
