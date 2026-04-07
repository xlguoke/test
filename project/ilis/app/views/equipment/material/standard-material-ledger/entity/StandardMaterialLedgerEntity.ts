import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export enum EMarkType {
  EXPIRED = '1',
  WARNING = '2',
}

export const MarkTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EMarkType.EXPIRED, label: '过期失效', color: 'red' },
  { key: EMarkType.WARNING, label: '余量预警', color: 'orange' },
])

/**
 * # 标准物质台账实体
 */
export class StandardMaterialLedgerEntity extends AnyDataBaseEntity {
  @TableField({ width: 80, isAlways: true, fixed: 'left' })
  @CustomField('标记')
  priorityWeightDisplay?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入标准物质名称或保管人后回车即可查询',
    isOnlySearch: true,
  })
  @SearchField({
    width: '310px',
  })
  keyword?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('标记', MarkTypeDict)
  priorityWeight?: number

  @TableField({ width: 200, ellipsis: true })
  @CustomField('标准物质名称')
  name?: string

  @TableField({ width: 150 })
  @CustomField('规格型号')
  specification?: string

  @TableField({ width: 150 })
  @CustomField('生产厂家')
  manufacturer?: string

  @TableField({ width: 120, sorter: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['productionDateStart', 'productionDateEnd'],
  })
  @SearchField()
  @CustomField('生产日期')
  productionDate?: Date | string

  @TableField({ width: 100 })
  @CustomField('有效期(月)')
  validPeriodMonths?: number

  @TableField({ width: 100, sorter: true })
  @CustomField('库存余量')
  inventoryQuantity?: number

  @TableField({ width: 80 })
  @CustomField('计量单位')
  unit?: string

  @TableField({ width: 100 })
  @CustomField('单价(元)')
  unitPrice?: number

  @TableField({ width: 120 })
  @CustomField('标准值')
  standardValue?: string

  @CustomField('余量阈值')
  thresholdValue?: number

  @TableField({ width: 100 })
  @CustomField('保管人')
  custodian?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 150,
  })
  @CustomField('操作')
  operation?: any

  /** 系统公司代码 */
  sysCompanyCode?: string

  /** 单位代码 */
  unitCode?: string
}
