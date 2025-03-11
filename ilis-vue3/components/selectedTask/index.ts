import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export { default as SelectedTask } from './index.vue'

export { type TaskData } from './api'

export class EqGoOutAuditEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('任务编号')
  testTaskCode?: string

  @TableField()
  @CustomField('记录编号')
  testRecordCode?: string

  @TableField()
  @CustomField('工程项目')
  projectName?: string

  @TableField()
  @CustomField('项目编号')
  projectCode?: string

  @TableField()
  @CustomField('委托单位')
  unitName?: string

  @TableField()
  @CustomField('检测人员')
  testPersons?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入任务编号/委托单位/工程项目查询',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('模糊查询')
  quickQryParam?: string
}
