import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType.ts'

/**
 * # 化学废物登记 - 已提交
 */
export class ChemicalWasteRegSubmitEntity extends AnyDataBaseEntity {
  @CustomField('功能室名称')
  laboratoryName?: string

  @CustomField('废物类型')
  type?: string

  @CustomField('PH值')
  phValue?: string

  @CustomField('总数量')
  totalValue?: string

  @CustomField('提交人')
  submitUserName?: string

  @CustomField('状态')
  handleStatus?: string

  @CustomField('投放次数')
  launchNum?: string

  @TableField({
    sorter: true,
    width: 150,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('提交时间')
  submitDate?: Date

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
