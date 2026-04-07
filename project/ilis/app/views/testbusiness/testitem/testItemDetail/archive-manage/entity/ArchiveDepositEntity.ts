import { CustomField } from '~/anyThing/decorator/CustomField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # 归档存放明细实体 📋
 * 对应统一存放/分开存放的每一条记录
 */
export class ArchiveDepositEntity extends AnyDataBaseEntity {
  /** 报告ID */
  @CustomField('报告ID')
  reportId?: string

  /** 归档类型: 0=自定义, 1=检测报告, 2=委托单, 3=原始记录单, 4=任务分配单 */
  @CustomField('归档类型')
  archiveType!: string

  /** 用户自定义归档标题 */
  @CustomField('自定义归档标题')
  userArchiveTitle?: string

  /** 关联对象编号 */
  @CustomField('关联对象编号')
  relatedObjectSn?: string

  /** 关联对象ID */
  @CustomField('关联对象ID')
  relatedObjectId?: string

  /** 档案编号 */
  @CustomField('档案编号')
  archiveSn?: string

  /** 归档地址ID */
  @CustomField('归档地址ID')
  archiveSiteId?: string

  /** 归档地址名称 */
  @CustomField('归档地址名称')
  archiveSite?: string

  /** 归档日期 */
  @CustomField('归档日期')
  archiveDate?: string

  /** 归档人员ID */
  @CustomField('归档人员ID')
  archivePersonId?: string

  /** 归档人员名称 */
  @CustomField('归档人员名称')
  archivePersonName?: string

  /** 存放方式: 0=统一存放, 1=分开存放 */
  @CustomField('存放方式')
  saveType?: string

  /** 是否可删除 */
  @CustomField('是否可删除')
  isRemove?: boolean

  /** 资料总数 */
  @CustomField('资料总数')
  total?: number

  /** 关联编号集合 */
  @CustomField('关联编号集合')
  codes?: string
}
