import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'

export class FileSearchEntity extends AnyBaseModel {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入文件名称',
  })
  @SearchField()
  @CustomField('快捷搜索')
  q?: string
}
