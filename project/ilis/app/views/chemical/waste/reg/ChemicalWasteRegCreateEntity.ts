import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType.ts'

/**
 * # 化学废物登记 - 已提交
 */
export class ChemicalWasteRegCreateEntity extends AnyDataBaseEntity {
  @CustomField('功能室名称')
  laboratoryName?: string

  @CustomField('废物类型')
  type?: string

  @CustomField('PH值')
  phValue?: number

  @CustomField('总数量')
  totalValue?: string

  @CustomField('投放次数')
  launchNum?: string

  @CustomField('液体废物')
  fluid?: boolean

  @TableField({
    width: 150,
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('创建时间')
  declare createDate: Date

  @TableField({
    isAlways: true,
    width: 180,
  })
  @CustomField('操作')
  Action?: any
}
