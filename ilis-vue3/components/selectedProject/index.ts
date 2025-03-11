import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export { default as SelectedProject } from './index.vue'

export { type ProjectData } from './api'

export class ProjectEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('工程项目')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入工程项目查询',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('模糊查询')
  quickQryParam?: string
}
