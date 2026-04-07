import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 检测任务entity
 */
export class TaskEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入任务编号/记录编号/报告编号/样品编号/样品名称',
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQryParam?: string

  @TableField({ width: 220 })
  @CustomField('任务编号')
  testTaskCode?: string

  @TableField({ width: 220 })
  @CustomField('记录编号')
  testRecordCode?: string

  @TableField({ width: 220 })
  @CustomField('报告编号')
  reportCode?: string

  @TableField({ width: 220 })
  @CustomField('样品编号')
  testObjectCode?: string

  @TableField({ width: 220 })
  @CustomField('样品名称')
  testSampleDisplayName?: string

  @TableField({ width: 220 })
  @CustomField('检测参数')
  testObjectParam?: string

  @TableField({ width: 220 })
  @CustomField('工程项目')
  projectNames?: string

  @TableField({ width: 220 })
  @CustomField('检测人员')
  testUser?: string

  @TableField({ width: 220 })
  @CustomField('检测时间')
  testTime?: string

  @TableField({ width: 100 })
  @CustomField('操作')
  operation?: string
}
