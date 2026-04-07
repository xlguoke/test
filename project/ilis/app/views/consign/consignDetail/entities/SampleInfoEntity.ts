import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

export class SampleInfoEntity extends AnyDataBaseEntity {
  @TableField({
    align: 'center',
    width: 60,
  })
  @CustomField('-')
  mark?: string

  @TableField({
    align: 'center',
    width: 60,
  })
  @CustomField('-')
  selected?: boolean

  @TableField()
  @CustomField(('检测样品'))
  testSampleDisplayName?: string

  @TableField()
  @CustomField('样品编号')
  testObjectCode?: string

  @TableField()
  @CustomField('来样编号')
  provideToCustomerSampleCode?: string

  @TableField()
  @CustomField('规格型号')
  standard?: string

  @TableField()
  @CustomField('工程部位/用途')
  projectPartAndUse?: string

  @TableField()
  @CustomField('检测参数')
  testParams?: string

  @TableField()
  @CustomField('资质类型')
  qualifications?: string

  @TableField()
  @CustomField('计价数量')
  sampleAmount?: string

  @TableField()
  @CustomField('金额（元）')
  testObjectPrice?: string

  @TableField({
    align: 'center',
  })
  @CustomField('操作')
  action?: string
}
