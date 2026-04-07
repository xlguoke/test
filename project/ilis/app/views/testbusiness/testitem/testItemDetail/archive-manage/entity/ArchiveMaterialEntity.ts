import { CustomField } from '~/anyThing/decorator/CustomField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # 归档资料实体 📋
 * 对应归档资料配置中的数据
 */
export class ArchiveMaterialEntity extends AnyDataBaseEntity {
  /** 资料名称 */
  @CustomField('资料名称')
  name?: string

  /** 资料编码 */
  @CustomField('资料编码')
  code?: string

  /** 排序号 */
  @CustomField('排序号')
  sortNo?: number

  /** 是否启用 */
  @CustomField('是否启用')
  isEnable?: string
}
