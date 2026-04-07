import type { StandardMaterialLedgerEntity } from '../../standard-material-ledger/entity/StandardMaterialLedgerEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export enum InType {
  Purchase = 'PURCHASE',
  Return = 'RETURN',
  Transfer = 'TRANSFER',
}

export const InboundTypeDict = AnyDictionaryHelper.createDictionaryArray([
  // { key: '', label: '全部' },
  { key: InType.Purchase, label: '购置入库' },
  { key: InType.Return, label: '归还入库' },
  { key: InType.Transfer, label: '调拨入库' },
])

export const InboundTypeFormDict = AnyDictionaryHelper.createDictionaryArray([
  { key: InType.Purchase, label: '购置入库' },
  { key: InType.Return, label: '归还入库' },
  { key: InType.Transfer, label: '调拨入库' },
])

/**
 * # 入库记录实体
 */
export class InboundRecordEntity extends AnyDataBaseEntity {
  /** 验收项ID */
  acceptItemId?: string

  /** 标准物质ID */
  materialId?: string

  /** 标准物质 */
  material?: StandardMaterialLedgerEntity

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入标准物质名称或入库人后回车即可查询',
    isOnlySearch: true,
  })
  @SearchField({ width: '310px' })
  keyword?: string

  @TableField({ width: 300, ellipsis: true })
  @CustomField('标准物质名称')
  materialName?: string

  @TableField({ width: 150 })
  @CustomField('规格型号')
  materialSpecification?: string

  @TableField({ width: 120, sorter: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('生产日期')
  productionDate?: Date | string

  @TableField({ width: 150 })
  @CustomField('生产厂家')
  manufacturer?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField({ width: 100 })
  @CustomField('入库类型', InboundTypeDict)
  inType?: string

  @TableField({ width: 100 })
  @CustomField('保管人')
  custodian?: string

  @TableField({ width: 100, sorter: true })
  @CustomField('入库数量')
  quantity?: number

  @TableField({ width: 100 })
  @CustomField('入库人员')
  operator?: string

  /** 入库人ID */
  operatorId?: string

  @TableField({ width: 120, sorter: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
    rangeMap: ['stockInDateStart', 'stockInDateEnd'],
  })
  @SearchField()
  @CustomField('入库日期')
  stockInDate?: Date | string

  @CustomField('附件')
  attachments?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 150,
  })
  @CustomField('操作')
  operation?: any
}
