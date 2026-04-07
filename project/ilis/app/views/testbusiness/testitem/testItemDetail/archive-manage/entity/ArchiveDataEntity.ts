import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 归档资料实体 📋
 * 用于归档资料配置管理 - 与 JSP 保持一致
 * 注意：id 继承自 AnyDataBaseEntity，无需重复声明
 * createDate/createName 使用 declare 重新声明以覆盖父类字段名
 */
export class ArchiveDataEntity extends AnyDataBaseEntity {
  /** 归档资料名称 - 可编辑 */
  @TableField({ width: 180 })
  @CustomField('归档资料')
  name?: string

  /** 配置日期 - 覆盖父类 createTime */
  @TableField({ width: 80, align: 'center', dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('配置日期')
  declare createDate: Date

  /** 配置人 - 覆盖父类 createBy */
  @TableField({ width: 80, align: 'center' })
  @CustomField('配置人')
  declare createName: string

  /** 操作列 */
  @TableField({ isAlways: true, fixed: 'right', width: 190, align: 'center' })
  @CustomField('操作')
  operation?: any
}
