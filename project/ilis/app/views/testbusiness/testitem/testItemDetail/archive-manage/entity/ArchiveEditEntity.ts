import type { EArchiveSaveType } from './EArchiveSaveType'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { ArchiveSaveTypeDict } from './EArchiveSaveType'

/**
 * # 归档编辑实体 📋
 * 用于资料归档编辑页面的表单渲染
 * 与 JSP 页面 reportArchiveDeposit.jsp 中的表单字段保持一致
 */
export class ArchiveEditEntity extends AnyDataBaseEntity {
  /** 归档日期 */
  @FormField({ formType: EFormItemType.DATE, dateFormat: EDateFormatType.YYYY_MM_DD, required: true })
  @CustomField('归档日期')
  archiveDate?: string

  /** 归档人员 */
  @FormField({ formType: EFormItemType.INPUT, required: true })
  @CustomField('归档人员')
  archivePersonName?: string

  /** 存放方式: 0=统一存放, 1=分开存放 */
  @FormField({ formType: EFormItemType.RADIO })
  @CustomField('存放方式', ArchiveSaveTypeDict)
  saveType?: EArchiveSaveType

  /** 档案编号（统一存放时使用） */
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('档案编号')
  archiveSn?: string

  /** 归档地址ID（统一存放时使用） */
  @CustomField('归档地址ID')
  archiveSiteId?: string

  /** 归档地址名称（统一存放时使用） */
  @FormField({ formType: EFormItemType.INPUT, disabled: true, required: true })
  @CustomField('归档地址')
  archiveSiteName?: string
}
