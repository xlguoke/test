import type { EArchiveStatus } from './EArchiveStatus'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { ArchiveStatusDict } from './EArchiveStatus'

/**
 * # 归档管理实体 📋
 * 用于项目检测详情 - 归档管理查询
 */
export class ArchiveManageEntity extends AnyDataBaseEntity {
  /** 报告id */
  @TableField({ width: 120 })
  @CustomField('报告编号')
  reportId?: string

  /** 报告编号 */
  @TableField({ width: 150 })
  @CustomField('报告编号')
  reportSn?: string

  /** 委托id */
  @CustomField('委托ID')
  consignId?: string

  /** 委托编号 */
  @TableField({ width: 150 })
  @CustomField('委托编号')
  consignSn?: string

  /** 委托单位id */
  @CustomField('委托单位ID')
  consignUnitId?: string

  /** 委托单位名称 */
  @TableField({ width: 200 })
  @CustomField('委托单位')
  consignUnitName?: string

  /** 工程项目id */
  @CustomField('工程项目ID')
  projectId?: string

  /** 工程项目名称 */
  @TableField({ width: 200 })
  @CustomField('工程项目')
  projectName?: string

  /** 报告类型 */
  @CustomField('报告类型')
  reportType?: string

  /** 归档状态（0:待归档、1:已归档、2:审核中、3:未通过） */
  @TableField({ width: 100, align: 'center' })
  @CustomField('归档状态', ArchiveStatusDict)
  archiveStatus?: EArchiveStatus

  /** 工程划分 */
  @TableField({ width: 150 })
  @CustomField('工程划分')
  unitProjectName?: string

  /** 任务ID列表 */
  @CustomField('任务ID列表')
  testTaskIds?: string

  /** 任务编号列表 */
  @TableField({ width: 150 })
  @CustomField('任务编号')
  testTaskCodes?: string

  /** 委托时间 */
  @TableField({ width: 120, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('委托日期')
  consignDate?: number

  /** 签发日期 */
  @TableField({ width: 120, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('签发日期')
  reportSignDate?: number

  /** 审核日期 */
  @TableField({ width: 120, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('审核日期')
  auditDate?: string

  /** 项目编号 */
  @TableField({ width: 150 })
  @CustomField('项目编号')
  projectCode?: string

  /** 报告资质 */
  @TableField({ width: 150 })
  @CustomField('报告资质')
  reportQualifications?: string

  /** 检测参数 */
  @TableField({ width: 150 })
  @CustomField('检测参数')
  testParamsName?: string

  /** 报告印章 */
  @TableField({ width: 150 })
  @CustomField('报告印章')
  reportSeals?: string

  /** 检测人员 */
  @TableField({ width: 120 })
  @CustomField('检测人员')
  testUsersName?: string

  /** 操作列 */
  @TableField({ isAlways: true, fixed: 'right', width: 150 })
  @CustomField('操作')
  operation?: any
}
