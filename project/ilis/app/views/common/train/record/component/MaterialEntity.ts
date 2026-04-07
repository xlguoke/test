import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export class MaterialEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入文件名称',
    isOnlySearch: true,
  })
  @SearchField()
  quickQryParam?: string

  @TableField()
  @CustomField('文件名称')
  name!: string

  @TableField()
  @CustomField('文件格式')
  extend?: string

  @TableField({
    customRender: ({ text }) => {
      let size = ((text || 0) / (1024 * 1024))
      if (size < 1) {
        size *= 1024
        return `${size.toFixed(2)}KB`
      }
      return `${size.toFixed(2)}M`
    },
  })
  @CustomField('文件大小')
  attachmentSize?: number

  @TableField()
  @CustomField('上传人')
  declare createName: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('上传时间')
  declare createDate: Date

  @TableField()
  @CustomField('操作')
  operation?: any

  @CustomField('文件地址')
  url!: string
}
