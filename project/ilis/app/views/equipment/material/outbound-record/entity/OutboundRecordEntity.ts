import type { StandardMaterialLedgerEntity } from '../../standard-material-ledger/entity/StandardMaterialLedgerEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export enum OutType {
  USE = 'USE',
  TRANSFER = 'TRANSFER',
  EXPIRED = 'EXPIRED',
}

export const outTypeDict = AnyDictionaryHelper.createDictionaryArray([
  // { key: '', label: '全部' },
  { key: 'USE', label: '领用出库' },
  { key: 'TRANSFER', label: '调拨出库' },
  { key: 'EXPIRED', label: '失效出库' },
])

export const outTypeFormDict = AnyDictionaryHelper.createDictionaryArray([
  { key: 'USE', label: '领用出库' },
  { key: 'TRANSFER', label: '调拨出库' },
  { key: 'EXPIRED', label: '失效出库' },
])

/**
 * # 出库记录实体
 */
export class OutboundRecordEntity extends AnyDataBaseEntity {
  // 标准物质
  material?: StandardMaterialLedgerEntity

  // 已返还数量
  returnQuantity?: number

  // 是否返还完成
  isReturned?: number

  // 出库人ID
  operatorId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入标准物质名称或出库人后回车即可查询',
    isOnlySearch: true,
  })
  @SearchField({ width: '310px' })
  keyword?: string

  @TableField({ width: 300, ellipsis: true })
  @CustomField('标准物质名称')
  materialName?: string

  @TableField({ width: 150 })
  @CustomField('规格型号')
  specification?: string // todo：需要从标准物质中获取

  materialSpecification?: string // 规格型号

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField({ width: 200, ellipsis: true })
  @CustomField('出库类型', outTypeDict)
  outType?: string

  @TableField({ width: 200, ellipsis: true })
  @CustomField('用途')
  purpose?: string

  @TableField({ width: 100, sorter: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('生产日期')
  productionDate?: Date

  @TableField({ width: 100 })
  @CustomField('出库数量')
  quantity?: number

  @TableField({ width: 100 })
  @CustomField('出库人员')
  operator?: string

  @SearchField()
  @TableField({ width: 120, sorter: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
    rangeMap: ['outDateStart', 'outDateEnd'],
  })
  @CustomField('出库日期')
  outDate?: Date

  @TableField({ width: 100 })
  @CustomField('库存余量')
  stockQuantity?: number

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 200,
  })
  @CustomField('操作')
  operation?: any
}
