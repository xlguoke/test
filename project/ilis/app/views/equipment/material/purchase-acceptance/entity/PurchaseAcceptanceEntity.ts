import type { PurchaseAcceptanceDetailEntity } from './PurchaseAcceptanceDetailEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export enum EPurchaseAcceptanceStatus {
  Writing = 'WRITING',
  Auditing = 'AUDITING',
  Passed = 'PASSED',
  Rejected = 'REJECTED',
}

export const PurchaseAcceptanceStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EPurchaseAcceptanceStatus.Writing, label: '填写中', color: '#0066EC' },
  { key: EPurchaseAcceptanceStatus.Auditing, label: '审核中', color: '#F59A23' },
  { key: EPurchaseAcceptanceStatus.Passed, label: '已通过', color: '#4B7902' },
  { key: EPurchaseAcceptanceStatus.Rejected, label: '未通过', color: '#D9001B' },
])

export const PurchaseAcceptanceStatusMap = {
  [EPurchaseAcceptanceStatus.Writing]: {
    label: '填写中',
    color: '#0066EC',
  },
  [EPurchaseAcceptanceStatus.Auditing]: {
    label: '审核中',
    color: '#F59A23',
  },
  [EPurchaseAcceptanceStatus.Passed]: {
    label: '已通过',
    color: '#4B7902',
  },
  [EPurchaseAcceptanceStatus.Rejected]: {
    label: '未通过',
    color: '#D9001B',
  },
}

export class PurchaseAcceptanceEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入标准物质名称或验收人后回车即可查询',
    isOnlySearch: true,
  })
  @SearchField({ width: '310px' })
  keyword?: string

  @TableField({
    width: 180,
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField()
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['acceptDateStart', 'acceptDateEnd'],
  })
  @CustomField('验收日期')
  acceptDate?: Date

  @SearchField()
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['purchaseDateStart', 'purchaseDateEnd'],
  })
  @CustomField('购置日期')
  purchaseDate?: Date

  @CustomField('验收人员ID')
  accepterId?: string

  @TableField({
    width: 120,
  })
  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('验收人员')
  accepter?: string

  @TableField({
    width: 120,
    sorter: true,
  })
  @CustomField('标准物质种数')
  itemCount?: number

  @TableField({
    width: 120,
    sorter: true,
  })
  @CustomField('总金额(元)')
  totalAmount?: number

  @TableField({
    width: 200,
    ellipsis: true,
  })
  @FormField({
    formType: EFormItemType.TEXTAREA,
    maxLength: 500,
    placeholder: '请输入验收结论',
  })
  @CustomField('验收结论')
  conclusion?: string

  @CustomField('验收通过后自动入库')
  isAutoStockIn?: boolean

  @TableField({
    width: 100,
    isAlways: true,
    fixed: 'right',
  })
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @CustomField('状态', PurchaseAcceptanceStatusDict)
  status?: EPurchaseAcceptanceStatus

  @CustomField('验收明细项列表')
  acceptItems?: PurchaseAcceptanceDetailEntity[]

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 200,
  })
  @CustomField('操作')
  operation?: any
}
