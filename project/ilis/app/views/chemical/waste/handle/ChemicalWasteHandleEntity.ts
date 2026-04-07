import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType.ts'

/**
 * # 化学废物登记 - 已提交
 */
export class ChemicalWasteHandleEntity extends AnyDataBaseEntity {
  @CustomField('废物名称')
  name?: string

  @CustomField('废物类型')
  type?: string

  @CustomField('处理数量')
  quantity?: string

  @CustomField('处理部门')
  departName?: string

  @TableField({
    width: 150,
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('处理日期')
  declare launchDate: Date

  @CustomField('经办人')
  declare createName: string

  @CustomField('状态')
  status?: string

  @TableField({
    isAlways: true,
    width: 180,
  })
  @CustomField('操作')
  Action?: any
}
