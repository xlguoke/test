import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export class AnalysisRecordEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入文件名称查询',
  })
  @SearchField()
  @CustomField('快速查询参数')
  quickQry?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField()
  @CustomField('上传日期')
  time?: string

  @TableField()
  @CustomField('文件名')
  attachmentName?: string

  @TableField({
    width: '15%',
  })
  @CustomField('文件大小')
  attachmentSize?: string

  @TableField({
    width: '15%',
  })
  @CustomField('上传日期')
  billingDate?: string

  @TableField({
    width: '15%',
  })
  @CustomField('上传人')
  initiator?: string

  @TableField({
    width: '15%',
  })
  @CustomField('解析结果')
  status?: string
}
