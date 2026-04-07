import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # entity
 */
export class UnqualifiedReportEntity extends AnyDataBaseEntity {
  @TableField({
    width: 150,
  })
  @CustomField('任务编号')
  testTaskCode?: string

  @TableField({
    width: 220,
  })
  @CustomField('样品名称')
  testSampleDisplayName?: string

  @TableField({
    width: 150,
  })
  @CustomField('样品编号')
  testObjectCode?: string

  @TableField({
    width: 150,
    ellipsis: true,
  })
  @CustomField('不合格情况')
  description?: string

  @TableField({
    width: 85,
  })
  @CustomField('创建人')
  createName?: number

  @TableField({
    width: 150,
    sorter: true,
  })
  @CustomField('创建时间')
  createDate?: number

  @TableField({
    width: 100,
  })
  @CustomField('状态')
  status?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 120,
  })
  @CustomField('操作')
  operation?: any
}
