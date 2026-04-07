import type { EArchiveStatus } from './EArchiveStatus'
import type { ESortField } from './ESortField'
import type { ESortOrder } from './ESortOrder'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { ArchiveStatusDict } from './EArchiveStatus'

/**
 * # 归档管理查询参数实体 📋
 */
export class ArchiveManageQueryEntity extends AnyDataBaseEntity {
  /** 归档状态筛选（0:待归档、1：已归档、2:审核中、3:未通过） */
  @FormField({ formType: EFormItemType.SELECT })
  @SearchField()
  @CustomField('归档状态', ArchiveStatusDict)
  status?: EArchiveStatus

  /** 工程项目ID */
  @CustomField('工程项目ID')
  consignProjectId?: string

  /** 签发日期 */
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['signDateStart', 'signDateEnd'],
  })
  @SearchField()
  @CustomField('签发日期')
  signDateSearch?: [string, string]

  /** 审核日期 */
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['auditDateStart', 'auditDateEnd'],
  })
  @SearchField()
  @CustomField('审核日期')
  auditDateSearch?: [string, string]

  /** 快速查询（报告编号、任务编号） */
  @FormField({ formType: EFormItemType.INPUT, placeholder: '报告编号、任务编号' })
  @SearchField()
  @CustomField('快速查询')
  quickQryParam?: string

  /** 排序列 */
  @CustomField('排序列')
  sort?: ESortField

  /** 排序方式（asc、desc），默认 desc */
  @CustomField('排序方式')
  order?: ESortOrder

  /** 页码，默认 1 */
  @CustomField('页码')
  page?: number

  /** 每页条数，默认 10 */
  @CustomField('每页条数')
  rows?: number
}
