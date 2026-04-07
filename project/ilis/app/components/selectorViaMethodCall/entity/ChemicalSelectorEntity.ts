import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 化学品选择实体
 */
export class ChemicalSelectorEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField()
  @CustomField('请输入化学名称/编号查询')
  quickQry?: string

  @TableField({ width: 150, fixed: 'left' })
  @CustomField('化学名称')
  name?: string

  @TableField({ width: 150 })
  @CustomField('化学名称编号')
  sn?: string

  @TableField({ width: 80 })
  @CustomField('所属类别')
  chemicalType?: string

  @TableField({ width: 80 })
  @CustomField('管理级别')
  manageLevel?: string

  specification?: string

  @TableField({ width: 80 })
  @CustomField('用途')
  effect?: string

  @TableField({ width: 80 })
  @CustomField('纯度')
  purity?: string

  @TableField({ width: 80 })
  @CustomField('浓度')
  concentration?: string | null

  @TableField({ width: 80 })
  @CustomField('计量单位')
  unit?: string

  @TableField({ width: 100 })
  @CustomField('可支配库存')
  amount?: number

  @TableField({ width: 80 })
  @CustomField('预警数量')
  warningAmount?: number

  lastUpdateTime?: string | null
}
